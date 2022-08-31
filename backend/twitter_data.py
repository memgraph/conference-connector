import traceback
import json
import logging

from utils import env
from tweepy import Client
from gqlalchemy import Match
from datetime import datetime, timedelta
from gqlalchemy.query_builders.memgraph_query_builder import Operator
from models import Participant, Tweet, Tweeted, memgraph
from twitter_stream import init_stream, nodes_relationship_queue

twitter_client = Client(bearer_token=None)

hashtag = "#memgraph"
user = "kgolubic"

logger = logging.getLogger("twitter_data")
logger.setLevel(logging.DEBUG)
handler = logging.FileHandler(filename="twitter_data.log")
logger.addHandler(handler)


def init_twitter_access():
    bearer_token = env.get_required_env("BEARER_TOKEN")
    twitter_client.bearer_token = bearer_token


def get_tweets_history(hashtag: str, days: int = 0, hours: int = 1):
    """Gets tweets from time period defined by the days and hours."""
    try:
        tweets = {}
        start_time = datetime.utcnow() - timedelta(days=days, hours=hours)
        request = twitter_client.search_recent_tweets(
            query=hashtag + " -is:retweet",
            start_time=start_time,
            tweet_fields=["context_annotations", "created_at"],
            user_fields=["profile_image_url"],
            expansions=["author_id"],
        )
        users = {u["id"]: u for u in request.includes["users"]}
        for tweet in request.data:
            if users[tweet.author_id]:
                user = users[tweet.author_id]
                # print(str(tweet.author_id) + " " + str(tweet.id) + " " + tweet.text)
                tweets[tweet.id] = {
                    "id": tweet.id,
                    "text": tweet.text,
                    "created_at": str(tweet.created_at),
                    "participant_id": user.id,
                    "participant_name": user.name,
                    "participant_username": user.username,
                }
        return tweets
    except Exception as e:
        traceback.print_exc()


def save_tweets_and_participant(tweets):
    for key, tweet in tweets.items():
        tweet_node = Tweet(
            id=tweet["id"], text=tweet["text"], created_at=tweet["created_at"]
        ).save(memgraph)
        participant_node = Participant(
            id=tweet["participant_id"],
            name=tweet["participant_name"],
            username=tweet["participant_username"],
            claimed=False,
        ).save(memgraph)

        tweeted_rel = Tweeted(
            _start_node_id=participant_node._id, _end_node_id=tweet_node._id
        ).save(memgraph)


def save_participant(participant):
    Participant(
        id=participant["id"],
        name=participant["name"],
        username=participant["username"],
        claimed=False,
    ).save(memgraph)


def save_and_claim(participant):
    Participant(
        id=participant["id"],
        name=participant["name"],
        username=participant["username"],
        claimed=True,
    ).save(memgraph)


def get_participant_by_username(username: str):
    try:
        request = twitter_client.get_user(username=username)
        participant = {
            "id": request.data.id,
            "name": request.data.name,
            "username": request.data.username,
        }
        return participant
    except Exception as e:
        raise e


def get_all_nodes_and_relationships():
    try:
        results = list(
            Match()
            .node(labels="Participant", variable="p")
            .to("TWEETED", variable="r")
            .node(labels="Tweet", variable="t")
            .return_()
            .execute()
        )

        participant_nodes = set()
        tweet_nodes = set()
        tweeted_relationships = set()

        for result in results:
            participant = result["p"]
            tweeted = result["r"]
            tweet = result["t"]

            p_id = participant._id
            p_label = next(iter(participant._labels))
            p_twitter_id = participant._properties["id"]
            p_twitter_name = participant._properties["name"]
            p_twitter_username = participant._properties["username"]
            p_twitter_claimed = participant._properties["claimed"]

            t_id = tweet._id
            t_label = next(iter(tweet._labels))
            t_twitter_id = tweet._properties["id"]
            t_twitter_text = tweet._properties["text"]
            t_twitter_created_at = tweet._properties["created_at"]

            r_id = tweeted._id
            r_start = tweeted._start_node_id
            r_end = tweeted._end_node_id
            r_type = tweeted._type

            participant_nodes.add(
                (
                    p_id,
                    p_label,
                    p_twitter_id,
                    p_twitter_name,
                    p_twitter_username,
                    p_twitter_claimed,
                )
            )
            tweet_nodes.add(
                (t_id, t_label, t_twitter_id, t_twitter_text, t_twitter_created_at)
            )
            tweeted_relationships.add((r_id, r_start, r_end, r_type))

        participants = [
            {
                "id": id,
                "label": label,
                "p_id": p_id,
                "name": name,
                "username": username,
                "claimed": claimed,
            }
            for id, label, p_id, name, username, claimed in participant_nodes
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

        tweeted = [
            {"id": id, "start": start, "end": end, "label": rel_type}
            for id, start, end, rel_type in tweeted_relationships
        ]

        nodes = participants + tweets

        response = {"nodes": nodes, "relationships": tweeted}
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
    logger.info("Getting participant nodes and relationships")
    try:
        results = (
            Match()
            .node(labels="Participant", username=username, variable="p")
            .to(variable="r")
            .node(variable="t")
            .return_()
            .execute()
        )
        participant_nodes = set()
        tweet_nodes = set()
        tweeted_relationships = set()

        for result in results:
            participant = result["p"]
            tweeted = result["r"]
            tweet = result["t"]

            p_id = participant._id
            p_label = next(iter(participant._labels))
            p_twitter_id = participant._properties["id"]
            p_twitter_name = participant._properties["name"]
            p_twitter_username = participant._properties["username"]
            p_twitter_claimed = participant._properties["claimed"]

            t_id = tweet._id
            t_label = next(iter(tweet._labels))
            t_twitter_id = tweet._properties["id"]
            t_twitter_text = tweet._properties["text"]
            t_twitter_created_at = tweet._properties["created_at"]

            r_id = tweeted._id
            r_start = tweeted._start_node_id
            r_end = tweeted._end_node_id
            r_type = tweeted._type

            participant_nodes.add(
                (
                    p_id,
                    p_label,
                    p_twitter_id,
                    p_twitter_name,
                    p_twitter_username,
                    p_twitter_claimed,
                )
            )
            tweet_nodes.add(
                (t_id, t_label, t_twitter_id, t_twitter_text, t_twitter_created_at)
            )
            tweeted_relationships.add((r_id, r_start, r_end, r_type))

            participants = [
            {
                "id": id,
                "label": label,
                "p_id": p_id,
                "name": name,
                "username": username,
                "claimed": claimed,
            }
            for id, label, p_id, name, username, claimed in participant_nodes
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

        tweeted = [
            {"id": id, "start": start, "end": end, "label": rel_type}
            for id, start, end, rel_type in tweeted_relationships
        ]

        nodes = participants + tweets

        response = {"nodes": nodes, "relationships": tweeted}
        return response
    except Exception as e: 
        return e

def get_new_tweets():
    try:
        data = nodes_relationship_queue.get()
        return data
    except Queue.Empty:
        logger.info("No new tweets! ")
        return None
        
        


def init_db_from_twitter():
    memgraph.drop_database()
    tweets = get_tweets_history(hashtag, days=7, hours=0)
    save_tweets_and_participant(tweets)
    init_stream(bearer_token=twitter_client.bearer_token)
