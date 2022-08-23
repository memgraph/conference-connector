from typing import Optional
from main import memgraph
from gqlalchemy import Node, Field, Relationship

class Participant(Node):
    id: int = Field(index = True, exists=True, unique=True, db=memgraph)
    username: str = Field(unique=True)

class Tweet(Node):
    id: int = Field(index = True, exists=True, unique=True, db=memgraph)
    text: str = Field(exists=True)

class Tweeted(Relationship, type="TWEETED"):
    pass

class Retweeted(Relationship, type="RETWEETED"):
    pass

class Likes(Relationship, type="LIKES"):
    pass

class Following(Relationship, type="FOLLOWING"):
    pass