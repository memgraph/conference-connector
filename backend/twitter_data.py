import traceback
from utils import env
from tweepy import Client
from models import memgraph, Tweet, Participant, Tweeted
from gqlalchemy import Match
from datetime import datetime, timedelta
import json

twitter_client = Client(bearer_token=None)

hashtag = "#memgraph"
user = "kgolubic"

def init_twitter_access():
    bearer_token = env.get_required_env('BEARER_TOKEN')
    twitter_client.bearer_token = bearer_token
        

def get_latest_tweets_with_hashtag(hashtag: str, days: int = 0, hours: int = 1):
    try: 
        tweets = {}
        last_hour = datetime.utcnow() - timedelta(days=days, hours = hours)
        request = twitter_client.search_recent_tweets(query=hashtag + " -is:retweet", start_time=last_hour, tweet_fields=['context_annotations', 'created_at'], user_fields=['profile_image_url'], expansions=["author_id"])
        users = {u["id"]: u for u in request.includes['users']}
        for tweet in request.data:
            if users[tweet.author_id]:
                user = users[tweet.author_id]
                #print(str(tweet.author_id) + " " + str(tweet.id) + " " + tweet.text)
                tweets[tweet.id] = {
                    'id' : tweet.id,
                    'text' : tweet.text,
                    'created_at' : str(tweet.created_at),
                    'participant_id' : user.id,
                    'participant_name' : user.name,
                    'participant_username' : user.username,
                }
        return tweets
    except Exception as e: 
        traceback.print_exc()
 
def save_tweets_and_participant(tweets):
    for key, tweet in tweets.items(): 
        tweet_node = Tweet(
            id = tweet['id'],
            text = tweet['text'],
            created_at = tweet['created_at']
        ).save(memgraph)
        participant_node = Participant(
            id = tweet['participant_id'],
            name = tweet['participant_name'],
            username = tweet['participant_username'],
        ).save(memgraph)

        tweeted_rel = Tweeted(
            _start_node_id=participant_node._id, _end_node_id=tweet_node._id
        ).save(memgraph)


def save_participant(participant):
    participant_node = models.Participant(
        id = participant['id'],
        name = participant['name'],
        username = participant['username'],
    )
    print(participant_node)

def get_participant_by_username(username: str):
    try: 
        request = twitter_client.get_user(username=username)
        participant = {
            'id' : request.data.id,
            'name' : request.data.name,
            'username' : request.data.username,
        }
        return participant
    except Exception as e: 
        traceback.print_exc()

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

        graph = list()
        for result in results:
            graph.append(result['p'])
            graph.append(result['r'])
            graph.append(result['t'])
    
            
        return graph

    except Exception as e:
        traceback.print_exc()
        return ("", 500)



def init_db_from_twitter():
    memgraph.drop_database()
    tweets = get_latest_tweets_with_hashtag(hashtag, days=7, hours=0)
    save_tweets_and_participant(tweets)


