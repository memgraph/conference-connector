from typing import Union
from fastapi import FastAPI
from tweepy import Client
from gqlalchemy import Memgraph, Match, Call
from utils import env
import logging
import os 
import time


twitter_client = Client(bearer_token=None)
memgraph = Memgraph()
log = logging.getLogger(__name__)
app = FastAPI()


def init_log():
    logging.basicConfig(level=logging.DEBUG)
    log.info("Logging enabled")


def init_twitter_access():
    bearer_token = env.get_required_env('BEARER_TOKEN')
    twitter_client.bearer_token = bearer_token
        

def connect_to_memgraph():
    connection_established = False
    while not connection_established:
        try:
            if memgraph._get_cached_connection().is_active():
                connection_established = True
        except:
            log.info("Memgraph probably isn't running.")
            time.sleep(4)



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








 
