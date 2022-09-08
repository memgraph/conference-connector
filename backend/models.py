from typing import Optional
from gqlalchemy import Node, Field, Relationship, Memgraph

memgraph = Memgraph()

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
