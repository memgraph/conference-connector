from typing import Union
from fastapi import FastAPI, Request, Response
from gqlalchemy import Match, Call
from models import memgraph
from twitter_data import (
    init_db_from_twitter,
    init_twitter_access,
    get_all_nodes_and_relationships,
)
import logging
import os
import time
import json


log = logging.getLogger(__name__)
users_log = logging.getLogger("users_log")
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
    init_db_from_twitter()


@app.get("/")
def read_root():
    return {"Hello": "World"}


@app.get("/graph")
async def get_graph():
    return get_all_nodes_and_relationships()


@app.post("/signup", status_code=200)
async def log_signup(request: Request, response: Response):
    user = await request.body()
    log.info("A new user has signed up", user)
    user_str = user.decode("utf-8")
    with open("signups.txt", "a", newline="") as file:
        file.write(user_str + "\n")
    file.close()

    user_json = json.loads(user)
    twitter_handle = user_json["username"]
    log.info("Twitter handle:", twitter_handle)

    results = (
        Match()
        .node(labels="Participant", username=twitter_handle, variable="n")
        .return_("n.username")
        .execute()
    )

    is_in_database = False if len(list(results)) == 0 else True
    # TODO - check how to correctly return status codes to the frontend
    # # check is valid twitter handle by connecting to the twitter API
    # is_twitter_user = False

    # if is_in_database:
    #     response.status_code = 201
    #     return response

    # # if the user is not already in the database and is twitter user
    # if is_twitter_user:
    #     # create user in the db
    #     response.status_code = 204
    #     return response

    # # then the data is not validated well on the client side, try again
    # else:
    #     raise HTTPException(
    #         status_code=400,
    #         detail=f"User with the twitter handle {twitter_handle} does not exist in the database and is not an active Twitter user.",
    #     )
