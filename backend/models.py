from typing import Optional
from gqlalchemy import Node, Field, Relationship, Memgraph
import logging.config
logging.config.fileConfig('./logging.ini', disable_existing_loggers=False)
log = logging.getLogger(__name__)
memgraph = None

def init():
    global memgraph
    memgraph = Memgraph()
    connection_established = False
    while not connection_established:
        try:
            if memgraph._get_cached_connection().is_active():
                connection_established = True
                log.info("Connected to memgraph.")
        except Exception as e :
            log.info("Memgraph probably isn't running.")
            log.error(e, exc_info=True)
            time.sleep(5)

init()

class Participant(Node):
    id: int = Field(index=True, exists=True, unique=True, db=memgraph)
    username: str = Field(unique=True)
    name: str = Field()
    profile_image: str = Field()
    claimed: bool = Field(default=False)


class Tweet(Node):
    id: int = Field(index=True, exists=True, unique=True, db=memgraph)
    text: str = Field(exists=True)
    created_at: str = Field()


class TweetedBy(Relationship, type="TWEETED_BY"):
    pass


class Retweeted(Relationship, type="RETWEETED"):
    pass


class Likes(Relationship, type="LIKES"):
    pass


class Following(Relationship, type="FOLLOWING"):
    pass
