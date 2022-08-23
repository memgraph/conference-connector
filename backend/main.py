from typing import Union
from fastapi import FastAPI
from tweepy import Client
from gqlalchemy import Memgraph, Match, Call
import logging
import os 
import time
import utils

client = Client(bearer_token=None)
memgraph = Memgraph()
log = logging.getLogger(__name__)
app = FastAPI()


def init_log():
    logging.basicConfig(level=logging.DEBUG)
    log.info("Logging enabled")


def init_twitter_access():
    bearer_token = get_required_env('BEARER_TOKEN')
    client.bearer_token = bearer_token
        

def connect_to_memgraph():
    connection_established = False
    while not connection_established:
        try:
            if memgraph._get_cached_connection().is_active():
                connection_established = True
        except:
            log.info("Memgraph probably isn't running.")
            time.sleep(4)



def twitter_api_helper():
    user = client.get_user(username="supe_katarina")

    id = user.data["id"]
    tweets = client.get_users_tweets(id=id, tweet_fields=['context_annotations','created_at','geo'])

    for tweet in tweets.data:
        print(tweets.data)
        print(tweet)




@app.on_event("startup")
def startup_event():
    init_log()
    init_twitter_access()
    connect_to_memgraph()
    twitter_api_helper()
    




@app.get("/")
def read_root():
     return {"Hello": "World"}

#Get whole graph


#Get ranking based on PageRank








 
