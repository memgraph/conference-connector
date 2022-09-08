import traceback
import json
import logging
import time
import sched
from queue import Queue
from utils import env
from tweepy import Client, Paginator
from gqlalchemy import Match, Call
from fastapi import BackgroundTasks
from datetime import datetime, timedelta
from gqlalchemy.query_builders.memgraph_query_builder import Operator, Order
from models import Participant, Tweet, TweetedBy, Retweeted, Likes, Following, memgraph
from twitter_stream import (
    init_stream,
    nodes_queue,
    close_stream,
)

twitter_client = Client(bearer_token=None)


# TODO: Refactor as list of options in config file, #name, @name2, #name3... and remove brackets
hashtag = "(#memgraph OR @Memgraph)"

logger = logging.getLogger("twitter_data")
logger.setLevel(logging.DEBUG)
handler = logging.FileHandler(filename="twitter_data.log")
logger.addHandler(handler)

relationship_queue = Queue()


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
            ).save(memgraph)

            participant_node = Participant(
                id=tweet["participant_id"],
                name=tweet["participant_name"],
                username=tweet["participant_username"],
                profile_image=tweet["participant_image"],
                claimed=False,
            ).save(memgraph)

            tweeted_rel = TweetedBy(
                _start_node_id=tweet_node._id, _end_node_id=participant_node._id
            ).save(memgraph)

    except Exception as e:
        traceback.print_exc()


def save_history_likes_retweets(tweets):
    try:
        request_counter = 35
        for key, tweet in tweets.items():
            print("Processing: " + tweet["text"])
            retweets = get_tweet_retweets(tweet["id"])
            likes = get_tweet_likes(tweet["id"])
            request_counter = request_counter - 1
            logger.info(request_counter)
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
                        .node(labels="Tweet", variable="t", id=tweet["id"])
                        .return_()
                        .execute()
                    )
                    if len(db_participant_node) and len(db_tweet_node):
                        p = db_participant_node[0]["p"]
                        t = db_tweet_node[0]["t"]
                        Likes(_start_node_id=p._id, _end_node_id=t._id).save(memgraph)

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
                        .node(labels="Tweet", variable="t", id=tweet["id"])
                        .return_()
                        .execute()
                    )
                    if len(db_participant_node) and len(db_tweet_node):
                        p = db_participant_node[0]["p"]
                        t = db_tweet_node[0]["t"]
                        Retweeted(_start_node_id=p._id, _end_node_id=t._id).save(
                            memgraph
                        )
            if request_counter == 0:
                # Sleep for 15 minutes to regenerate request window
                time.sleep(900)
                request_counter = 35

    except Exception as e:
        traceback.print_exc()


def save_history_following():
    try:
        participants = (
            Match().node(labels="Participant", variable="p").return_().execute()
        )
        par_dic = {}
        for participant in participants:
            p = participant["p"]
            par_dic[p._properties["id"]] = {
                "id": p._id,
            }
        requests = 15
        for t_id, participant in par_dic.items():
            requests = requests - 1
            followers = get_participant_followers(t_id)
            if followers is not None:
                for follower in followers:
                    if follower.id in par_dic.keys():
                        Following(
                            _start_node_id=par_dic[follower.id]["id"],
                            _end_node_id=participant["id"],
                        ).save(memgraph)

            if requests == 0:
                # Sleep for 15 minutes to regenerate request window
                time.sleep(900)
                requests = 15
    except Exception as e:
        traceback.print_exc()


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
        max_results=100,
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
            .return_()
            .order_by(properties=("p.rank", Order.DESC))
            .execute()
        )
        page_rank = list()
        for result in results:
            participant = result["p"]
            page_rank.append(
                {
                    "fullName": participant._properties["name"],
                    "username": participant._properties["username"],
                }
            )
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
    Participant(
        id=participant["id"],
        name=participant["name"],
        username=participant["username"],
        profile_image="None",
        claimed=True,
    ).save(memgraph)


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
        return e


def get_new_tweets():
    try:
        data = nodes_queue.get()
    except Queue.Empty:
        logger.info("No new tweets! ")


def init_db_from_twitter():
    tweets = get_tweets_history(hashtag)
    save_history(tweets)
    # save_history_following()
    # save_history_likes_retweets(tweets)
    # init_stream(bearer_token=twitter_client.bearer_token)


def close_connections():
    close_stream()
