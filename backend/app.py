from typing import Union
from fastapi import FastAPI
from gqlalchemy import Match, Call
from models import memgraph
from twitter_data import init_db_from_twitter, init_twitter_access, get_all_nodes_and_relationships
import logging
import os 
import time

log = logging.getLogger(__name__)
app = FastAPI()

def init_log():
    logging.basicConfig(level=logging.DEBUG)
    log.info("Logging enabled")


def connect_to_memgraph():
    
    connection_established = False
    while not connection_established:
        try:
            if memgraph._get_cached_connection().is_active():
                connection_established = True
                log.info("Connected to memgraph.")
        except:
            log.info("Memgraph probably isn't running.")
            time.sleep(4)



@app.on_event("startup")
def startup_event():
    init_log()
    init_twitter_access()
    connect_to_memgraph()
    #init_db_from_twitter()
    
@app.get("/")
def read_root():
     return {"Hello": "World"}



@app.get("/graph")
async def get_graph():
    return get_all_nodes_and_relationships()










 
