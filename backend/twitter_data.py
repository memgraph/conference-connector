import traceback
import json
import logging.config
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



logging.config.fileConfig('./logging.ini', disable_existing_loggers=False)
log = logging.getLogger(__name__)

limit_likes_retweets = None
limit_following = None
running_thread = None

twitter_client = Client(bearer_token=None)
twitter_rule = None

def init_twitter_env():
    global twitter_rule
    log.info("Setting u twitter token!")
    twitter_client.bearer_token = env.get_required_env("BEARER_TOKEN")
    twitter_rule = env.get_required_env("TWITTER_RULE")


def get_tweets_history(twitter_rule: str):
    log.info("Getting the tweets from the previous 7 days for: " + twitter_rule)
    try:
        paginator = Paginator(
            twitter_client.search_recent_tweets,
            query=twitter_rule,
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
        log.error(e, exc_info=True)
        raise e


def save_history(tweets):
    log.info("Saving the tweets to memgraph from previous 7 days.")
    for key, tweet in tweets.items():
            try:
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
                try:
                   tr = tweeted_rel.load(memgraph)
                   pass
                except:
                    memgraph.save_relationship(tweeted_rel)
              
            except Exception as e:
                log.error(e, exc_info=True)
    #Add all tweets and participants to backlog  
    add_history_to_backlog()


def add_history_to_backlog():
    log.info("Adding tweets and participants to backlog for processing, previous 7 days.")
    
    participants_results = list(
        Match().node(labels="Participant", variable="p").return_().execute()
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
    tweets_results = list(
        Match().node(labels="Tweet", variable="t").return_().execute()
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
    log.info("Getting all participants by rank!")
    try:
        results = list(
            Match()
            .node(labels="Participant", variable="p")
            .where(item="p.claimed", operator=Operator.EQUAL, expression="True")
            .return_()
            .order_by(properties=("p.rank", Order.DESC))
            .execute()
        )
        page_rank = list()
        position = 0
        for result in results:
            position += 1
            participant = result["p"]
            page_rank.append(
                {
                    "position": str(position),
                    "fullName": participant._properties["name"],
                    "username": participant._properties["username"],
                }
            )
        response = {"page_rank": page_rank}
        return response
    except Exception as e:
        log.error(e, exc_info=True)
        raise e


def save_participant(participant):
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
    log.info("Getting participant by username: " + username)
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
        log.error(e, exc_info=True)
        raise e


def get_all_nodes_and_relationships():
    log.info("Getting hole graph. ")
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
                            n._properties["rank"],
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
            relationships.add((r._id, r._start_node_id, r._end_node_id, r._type))

        participants = [
            {
                "id": id,
                "label": label,
                "p_id": p_id,
                "name": name,
                "username": username,
                "image": image,
                "claimed": claimed,
                "rank": rank,
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
        log.error(e, exc_info=True)
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
        log.error(e, exc_info=True)
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
    log.info("New signup: ", username, "email is: ", email, "full name is: ", name )
    with open("./signups.csv", "a", newline="") as file:
        file.write(username + "," + name + "," + email + "\n")
    file.close()


def get_participant_nodes_relationships(username: str):
    log.info("Getting subgraph for participant: " + username)
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
                            n._properties["rank"],
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
            relationships.add((r._id, r._start_node_id, r._end_node_id, r._type))

        participants = [
            {
                "id": id,
                "label": label,
                "p_id": p_id,
                "name": name,
                "username": username,
                "image": image,
                "claimed": claimed,
                "rank": rank,
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
        log.error(e, exc_info=True)
        return e


def run_continuously(interval=1):
    log.info("Setting up threaded events!")
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


def update_request_limit_data():
    log.info("Updating request limit data!")
    global limit_likes_retweets
    global limit_following
    limit_likes_retweets = 35
    limit_following = 7
    log.info("Status, likes and retweets limit: " + str(limit_likes_retweets) + " following limit:" + str(limit_following))


def update_graph_tweets():
    log.info("Starting updating tweets relationships: ")
    log.info("Tweet backlog status: " + str(len(tweets_backlog)))
    global limit_likes_retweets

    while limit_likes_retweets > 0 and tweets_backlog:
        tweet = tweets_backlog.pop()
        created_at_str = tweet["created_at"]
        created_at = datetime.fromisoformat(created_at_str)
        current = datetime.now(timezone.utc)
        delta = current - created_at
        hours = delta.total_seconds() / (60 * 60)
        if delta.total_seconds() > 180:
            try:
                log.info(tweet)
                likes = get_tweet_likes(tweet["t_id"])
                retweets = get_tweet_retweets(tweet["t_id"])
                limit_likes_retweets -= 1
                log.info(limit_likes_retweets)
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
                            try:
                                likes = l.load(memgraph)
                                pass
                            except:
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
                            r = Retweeted(_start_node_id=p._id, _end_node_id=t._id)
                            try:
                                retweeted = r.load(memgraph)
                                pass
                            except:
                                memgraph.save_relationship(r)
            except Exception as e:
                log.error(e, exc_info=True)
                tweets_backlog.append(tweet)
                break
        else:
            tweets_backlog.append(tweet)


def update_graph_participants():
    log.info("Starting updating participants followers: ")
    log.info("Participants backlog status: " + str(len(participants_backlog)))
    global limit_following
    while limit_following > 0 and participants_backlog:
        new_participant = participants_backlog.pop()
        try:
            log.info(new_participant)
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
            log.info(limit_following)
            followers = get_participant_followers(new_participant["p_id"])
            if followers is not None:
                for follower in followers:
                    if follower.id in par_dic.keys():
                        f = Following(
                            _start_node_id=par_dic[follower.id]["id"],
                            _end_node_id=new_participant["id"],
                        )
                        try:
                            following = f.load(memgraph)
                            pass
                        except:
                            memgraph.save_relationship(f)
        except TooManyRequests as te:
            log.info("Too much request for followers!")
            participants_backlog.append(new_participant)
            break
        except Exception as e:
            log.error(e, exc_info=True)


def schedule_graph_updates():
    log.info("Scheduling graph updates tasks.")
    global limit_likes_retweets
    global limit_following
    limit_likes_retweets = 35
    limit_following = 7
    schedule.every(15).minutes.do(update_request_limit_data)
    schedule.every(3).minutes.do(update_graph_tweets)
    schedule.every(3).minutes.do(update_graph_participants)


def init_db_from_twitter():
    log.info("Init db from twitter and history.")
    tweets = get_tweets_history(twitter_rule)
    save_history(tweets)
    schedule_graph_updates()
    global running_thread
    running_thread = run_continuously()
    init_stream(bearer_token=twitter_client.bearer_token, twitter_rule=twitter_rule)


def close_connections():
    log.info("Close all connections.")
    global running_thread
    running_thread.clear()
    close_stream()
