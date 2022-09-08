from typing import Union
from fastapi import (
    FastAPI,
    Request,
    Response,
    HTTPException,
    WebSocket,
    BackgroundTasks,
)
from fastapi.testclient import TestClient
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
    get_participant_nodes_relationships,
    get_new_tweets,
    close_connections,
    get_ranked_participants,
)
import logging
import os
import time
import json
import traceback


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


def set_up_memgraph():
    try: 
        memgraph.drop_database()
        memgraph.execute("CALL pagerank_online.set(100, 0.2) YIELD *")
        memgraph.execute(
            """CREATE TRIGGER pagerank_trigger 
                BEFORE COMMIT 
                EXECUTE CALL pagerank_online.update(createdVertices, createdEdges, deletedVertices, deletedEdges) YIELD *
                SET node.rank = rank"""
        )
    except Exception as e: 
        traceback.print_exc()
        

@app.on_event("startup")
def startup_event():

    init_log()
    init_twitter_access()
    init_signups_log()
    connect_to_memgraph()
    set_up_memgraph()
    init_db_from_twitter()


@app.get("/")
def read_root():
    return {"Hello": "World"}


@app.get("/graph")
async def get_graph():
    try:
        return get_all_nodes_and_relationships()
    except:
        raise HTTPException(status_code=500, detail="Issue with getting the graph.")


@app.get("/user/{username}")
async def get_participant_subgraph(username: str):
    try:
        return get_participant_nodes_relationships(username)
    except Exception as e:
        raise HTTPException(
            status_code=500, detail="Issue with getting the participant subgraph."
        )


@app.get("/ranked")
async def get_best_ranked():
    try:
        return get_ranked_participants()
    except Exception as e:
        raise HTTPException(
            status_code=500, detail="Issue with getting the best ranked participants."
        )


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
