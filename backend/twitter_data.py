import traceback
import json
import logging
import time
import threading
import schedule
from datetime import datetime, timezone
from queue import Queue
from utils import env
from tweepy import Client, Paginator, TweepyException, TooManyRequests
from gqlalchemy import Match, Call
from fastapi import BackgroundTasks
from datetime import datetime, timedelta
from gqlalchemy.query_builders.memgraph_query_builder import Operator, Order
from models import Participant, Tweet, TweetedBy, Retweeted, Likes, Following, memgraph
from twitter_stream import (
    init_stream,
    tweets_backlog,
    participants_backlog,
    close_stream,
)

twitter_client = Client(bearer_token=None)


# TODO: Refactor as list of options in config file, #name, @name2, #name3... and remove brackets
hashtag = "(#memgraph OR @Memgraph)"

logger = logging.getLogger("twitter_data")
logger.setLevel(logging.DEBUG)
handler = logging.FileHandler(filename="twitter_data.log")
logger.addHandler(handler)

limit_likes_retweets = None
limit_following = None

running_thread = None


def init_twitter_access():
    bearer_token = env.get_required_env("BEARER_TOKEN")
    twitter_client.bearer_token = bearer_token


def get_tweets_history(hashtag: str):
    """Gets tweets from previous 7 days."""
    try:
        paginator = Paginator(
            twitter_client.search_recent_tweets,
            query=hashtag + " -is:retweet",
            tweet_fields=["context_annotations", "created_at"],
            user_fields=["profile_image_url"],
            expansions=["author_id"],
            max_results=100,
            limit=5,
        )

        tweets = {}
        for page in paginator:
            users = {u["id"]: u for u in page.includes["users"]}
            for tweet in page.data:
                if users[tweet.author_id]:
                    user = users[tweet.author_id]
                    tweets[tweet.id] = {
                        "id": tweet.id,
                        "text": tweet.text,
                        "created_at": str(tweet.created_at),
                        "participant_id": user.id,
                        "participant_name": user.name,
                        "participant_username": user.username,
                        "participant_image": user.profile_image_url,
                    }

        return tweets

    except Exception as e:
        traceback.print_exc()
        raise e


def save_history(tweets):
    try:
        for key, tweet in tweets.items():

            tweet_node = Tweet(
                id=tweet["id"], text=tweet["text"], created_at=tweet["created_at"]
            )
            tweet_node = memgraph.save_node(tweet_node)

            participant_node = Participant(
                id=tweet["participant_id"],
                name=tweet["participant_name"],
                username=tweet["participant_username"],
                profile_image=tweet["participant_image"],
                claimed=False,
            )
            participant_node = memgraph.save_node(participant_node)

            tweeted_rel = TweetedBy(
                _start_node_id=tweet_node._id, _end_node_id=participant_node._id
            )
            memgraph.save_relationship(tweeted_rel)

        add_history_to_backlog()
    except Exception as e:
        traceback.print_exc()


def add_history_to_backlog():

    participants_results = list(
        Match()
        .node(labels="Participant", variable="p")
        .return_()
        .execute()
    )

    for p in participants_results:
        participant_node = p["p"]
        participant = {
            "id": participant_node._id,
            "label": next(iter(participant_node._labels)),
            "p_id": participant_node._properties["id"],
            "name": participant_node._properties["name"],
            "username": participant_node._properties["username"],
            "image": participant_node._properties["profile_image"],
            "claimed": participant_node._properties["claimed"],
        }
        logger.info(participant_node)
        participants_backlog.appendleft(participant)

    tweets_results = list(
        Match()
        .node(labels="Tweet", variable="t")
        .return_()
        .execute()
    )

    for t in tweets_results:
        tweet_node = t["t"]
        tweet = {
            "id": tweet_node._id,
            "label": next(iter(tweet_node._labels)),
            "t_id": tweet_node._properties["id"],
            "text": tweet_node._properties["text"],
            "created_at": tweet_node._properties["created_at"],
        }
        tweets_backlog.appendleft(tweet)


def get_tweet_retweets(id: int):
    users = list()
    paginator = Paginator(
        twitter_client.get_retweeters,
        id=id,
        user_fields=["profile_image_url"],
        max_results=100,
        limit=5,
    )
    for page in paginator:
        if page.data is not None:
            users.extend(page.data)
    return users


def get_tweet_likes(id: int):
    users = list()
    paginator = Paginator(
        twitter_client.get_liking_users,
        id=id,
        user_fields=["profile_image_url"],
        max_results=100,
        limit=5,
    )
    for page in paginator:
        if page.data is not None:
            users.extend(page.data)
    return users


def get_participant_followers(id: int):
    followers = list()
    paginator = Paginator(
        twitter_client.get_users_followers,
        id=id,
        user_fields=["profile_image_url"],
        max_results=1000,
        limit=5,
    )
    for page in paginator:
        if page.data is not None:
            followers.extend(page.data)
    return followers


def get_ranked_participants():
    try:
        results = list(
            Match()
            .node(labels="Participant", variable="p")
            .where(item="p.claimed", operator=Operator.EQUAL, expression="False")
            .return_()
            .order_by(properties=("p.rank", Order.DESC))
            .execute()
        )
        page_rank = list()
        for result in results:
            participant = result["p"]
            page_rank.append({
                "rank": participant._properties["rank"],
                "name": participant._properties["name"],
                "username": participant._properties["username"]
            })

        response = {"page_rank": page_rank}
        return response
    except Exception as e:
        traceback.print_exc()
        raise e


def save_participant(participant):
    # TODO: Fix image
    Participant(
        id=participant["id"],
        name=participant["name"],
        username=participant["username"],
        profile_image="None",
        claimed=False,
    ).save(memgraph)


def save_and_claim(participant):
    participant = Participant(
        id=participant["id"],
        name=participant["name"],
        username=participant["username"],
        profile_image="None",
        claimed=True,
    )
    memgraph.save_node(participant)


def get_participant_by_username(username: str):
    try:
        request = twitter_client.get_user(username=username)
        participant = {
            "id": request.data.id,
            "name": request.data.name,
            "username": request.data.username,
            "profile_image": request.data.profile_image_url,
        }
        return participant
    except Exception as e:
        raise e


def get_all_nodes_and_relationships():
    try:
        results = list(
            Match()
            .node(variable="n")
            .to(variable="r")
            .node(variable="m")
            .return_()
            .execute()
        )

        participant_nodes = set()
        tweet_nodes = set()
        relationships = set()

        for result in results:
            nodes = list()
            nodes.append(result["n"])
            nodes.append(result["m"])
            for n in nodes:
                n_label = next(iter(n._labels))
                if n_label == "Participant":
                    participant_nodes.add(
                        (
                            n._id,
                            n_label,
                            n._properties["id"],
                            n._properties["name"],
                            n._properties["username"],
                            n._properties["profile_image"],
                            n._properties["claimed"],
                            n._properties["rank"]
                        )
                    )
                if n_label == "Tweet":
                    tweet_nodes.add(
                        (
                            n._id,
                            n_label,
                            n._properties["id"],
                            n._properties["text"],
                            n._properties["created_at"],
                        )
                    )

            r = result["r"]
            relationships.add(
                (r._id, r._start_node_id, r._end_node_id, r._type))

        participants = [
            {
                "id": id,
                "label": label,
                "p_id": p_id,
                "name": name,
                "username": username,
                "image": image,
                "claimed": claimed,
                "rank": rank
            }
            for id, label, p_id, name, username, image, claimed, rank in participant_nodes
        ]

        tweets = [
            {
                "id": id,
                "label": label,
                "t_id": t_id,
                "text": text,
                "created_at": created_at,
            }
            for id, label, t_id, text, created_at in tweet_nodes
        ]

        rel = [
            {"id": id, "start": start, "end": end, "label": rel_type}
            for id, start, end, rel_type in relationships
        ]

        nodes = participants + tweets

        response = {"nodes": nodes, "relationships": rel}
        return response

    except Exception as e:
        return e


def whitelist_participant(username: str):
    """Sets participant's claimed property to True.

    Args:
        username (str): Participant's username - Twitter handle
    """
    try:
        results = list(
            Match()
            .node(labels="Participant", username=username, variable="n")
            .set_(item="n.claimed", operator=Operator.ASSIGNMENT, literal=True)
            .return_()
            .execute()
        )

    except Exception as e:
        raise e


def is_participant_in_db(username: str):
    """Checks if there is a participant with certain username in the database.

    Args:
        username (str): Participant's username - Twitter handle
    """

    results = (
        Match()
        .node(labels="Participant", username=username, variable="n")
        .return_("n.username")
        .execute()
    )

    return False if len(list(results)) == 0 else True


def log_participant(username: str, email: str, name: str):
    """Logs the participant's data to the signups.csv file

    Args:
        username (str): Twitter handle
        email (str): Participant's email
        name (str): Participant's full name
    """

    with open("signups.csv", "a", newline="") as file:
        file.write(username + "," + name + "," + email)
    file.close()


def get_participant_nodes_relationships(username: str):
    try:
        results = (
            Match()
            .node(labels="Participant", username=username, variable="p")
            .from_(variable="r")
            .node(variable="m")
            .return_()
            .execute()
        )
        participant_nodes = set()
        tweet_nodes = set()
        relationships = set()

        for result in results:
            nodes = list()
            nodes.append(result["p"])
            nodes.append(result["m"])
            for n in nodes:
                n_label = next(iter(n._labels))
                if n_label == "Participant":
                    participant_nodes.add(
                        (
                            n._id,
                            n_label,
                            n._properties["id"],
                            n._properties["name"],
                            n._properties["username"],
                            n._properties["profile_image"],
                            n._properties["claimed"],
                            n._properties["rank"]
                        )
                    )
                if n_label == "Tweet":
                    tweet_nodes.add(
                        (
                            n._id,
                            n_label,
                            n._properties["id"],
                            n._properties["text"],
                            n._properties["created_at"],
                        )
                    )
            r = result["r"]
            relationships.add(
                (r._id, r._start_node_id, r._end_node_id, r._type))

        participants = [
            {
                "id": id,
                "label": label,
                "p_id": p_id,
                "name": name,
                "username": username,
                "image": image,
                "claimed": claimed,
                "rank": rank
            }
            for id, label, p_id, name, username, image, claimed, rank in participant_nodes
        ]

        tweets = [
            {
                "id": id,
                "label": label,
                "t_id": t_id,
                "text": text,
                "created_at": created_at,
            }
            for id, label, t_id, text, created_at in tweet_nodes
        ]

        rel = [
            {"id": id, "start": start, "end": end, "label": rel_type}
            for id, start, end, rel_type in relationships
        ]

        nodes = participants + tweets

        response = {"nodes": nodes, "relationships": rel}
        return response

    except Exception as e:
        return e


def run_continuously(interval=1):
    cease_continuous_run = threading.Event()

    class ScheduleThread(threading.Thread):
        @classmethod
        def run(cls):
            while not cease_continuous_run.is_set():
                schedule.run_pending()
                time.sleep(interval)
    continuous_thread = ScheduleThread()
    continuous_thread.start()
    return cease_continuous_run


def update_request_data():
    global limit_likes_retweets
    global limit_following
    limit_likes_retweets = 35
    limit_following = 7


def update_graph_tweets():
    logger.info("Tweet deque: " + str(len(tweets_backlog)))
    global limit_likes_retweets

    while limit_likes_retweets > 0 and tweets_backlog:
        tweet = tweets_backlog.pop()
        created_at_str = tweet["created_at"]
        created_at = datetime.fromisoformat(created_at_str)
        current = datetime.now(timezone.utc)
        delta = current - created_at
        hours = delta.total_seconds() / (60*60)
        if delta.total_seconds() > 180:
            try:
                logger.info(tweet)
                likes = get_tweet_likes(tweet["t_id"])
                retweets = get_tweet_retweets(tweet["t_id"])
                limit_likes_retweets -= 1
                logger.info(limit_likes_retweets)
                if likes is not None:
                    for user in likes:
                        db_participant_node = list(
                            Match()
                            .node(labels="Participant", variable="p", id=user.id)
                            .return_()
                            .execute()
                        )
                        db_tweet_node = list(
                            Match()
                            .node(labels="Tweet", variable="t", id=tweet["t_id"])
                            .return_()
                            .execute()
                        )
                        if len(db_participant_node) and len(db_tweet_node):
                            p = db_participant_node[0]["p"]
                            t = db_tweet_node[0]["t"]
                            l = Likes(_start_node_id=p._id, _end_node_id=t._id)
                            memgraph.save_relationship(l)

                if retweets is not None:
                    for user in retweets:
                        db_participant_node = list(
                            Match()
                            .node(labels="Participant", variable="p", id=user.id)
                            .return_()
                            .execute()
                        )
                        db_tweet_node = list(
                            Match()
                            .node(labels="Tweet", variable="t", id=tweet["t_id"])
                            .return_()
                            .execute()
                        )
                        if len(db_participant_node) and len(db_tweet_node):
                            p = db_participant_node[0]["p"]
                            t = db_tweet_node[0]["t"]
                            r = Retweeted(_start_node_id=p._id,
                                          _end_node_id=t._id)
                            memgraph.save_relationship(r)
            except Exception as e:
                traceback.print_exc()
                tweets_backlog.append(tweet)
                break
        else:
            tweets_backlog.append(tweet)


def update_graph_participants():
    logger.info("Participans_backlog deque: " + str(len(participants_backlog)))
    global limit_following
    while limit_following > 0 and participants_backlog:
        new_participant = participants_backlog.pop()
        try:
            logger.info(new_participant)
            participants = list(
                Match().node(labels="Participant", variable="p").return_().execute()
            )
            par_dic = {}
            for participant in participants:
                p = participant["p"]
                par_dic[p._properties["id"]] = {
                    "id": p._id,
                }
            limit_following -= 1
            logger.info(limit_following)
            followers = get_participant_followers(new_participant["p_id"])
            if followers is not None:
                for follower in followers:
                    if follower.id in par_dic.keys():
                        f = Following(
                            _start_node_id=par_dic[follower.id]["id"],
                            _end_node_id=new_participant["id"],
                        )
                        memgraph.save_relationship(f)
        except TooManyRequests as te:
            logger.info("Too much request for followers!")
            participants_backlog.append(new_participant)
            break
        except Exception as e:
            traceback.print_exc()


def schedule_graph_updates():
    global limit_likes_retweets
    global limit_following
    limit_likes_retweets = 35
    limit_following = 7
    schedule.every(15).minutes.do(update_request_data)
    schedule.every(3).minutes.do(update_graph_tweets)
    schedule.every(3).minutes.do(update_graph_participants)



def init_db_from_twitter():

    tweets = get_tweets_history(hashtag)
    save_history(tweets)
    schedule_graph_updates()
    global running_thread
    running_thread = run_continuously()
    init_stream(bearer_token=twitter_client.bearer_token)


def close_connections():
    global running_thread
    running_thread.clear()
    close_stream()
