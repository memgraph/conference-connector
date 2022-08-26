from typing import Union
from fastapi import FastAPI, Request, Response, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from gqlalchemy import Match, Call
from models import memgraph
from twitter_data import (
    init_db_from_twitter,
    init_twitter_access,
    get_all_nodes_and_relationships,
    get_participant_by_username,
    whitelist_participant,
    is_participant_in_db,
    log_participant,
    save_and_claim,
)
import logging
import os
import time
import json


log = logging.getLogger(__name__)
users_log = logging.getLogger("users_log")
app = FastAPI()
origins = [
    "http://localhost:3000",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def init_log():
    logging.basicConfig(level=logging.DEBUG)
    log.info("Logging enabled")


def init_signups_log():
    with open("signups.csv", "a", newline="") as file:
        file.truncate()
        file.write("username,name,email\n")
    file.close()


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
    init_signups_log()
    connect_to_memgraph()
    init_db_from_twitter()


@app.get("/")
def read_root():
    return {"Hello": "World"}


@app.get("/graph")
async def get_graph():
    return get_all_nodes_and_relationships()


@app.post("/signup")
async def log_signup(request: Request):
    user = await request.body()

    user_json = json.loads(user)
    username = user_json["username"]
    name = user_json["name"]
    email = user_json["email"]
    log.info("Twitter handle:", username)

    log_participant(username, name, email)

    is_participant = is_participant_in_db(username)

    if is_participant:
        whitelist_participant(username)

    else:
        try:
            participant = get_participant_by_username(username)
            save_and_claim(participant)
        except:
            raise HTTPException(
                status_code=404,
                detail=f"User with username {username} does not exist on Twitter.",
            )
