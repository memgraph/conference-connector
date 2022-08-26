from tweepy import StreamingClient, StreamRule
from gqlalchemy import Create
from models import memgraph, Participant, Tweet, Tweeted
import logging
import traceback

logger = logging.getLogger("tweepy")
logger.setLevel(logging.DEBUG)
handler = logging.FileHandler(filename="twitter_stream.log")
logger.addHandler(handler)

def connect_to_memgraph():

    connection_established = False
    while not connection_established:
        try:
            if memgraph._get_cached_connection().is_active():
                connection_established = True
                logger.info("Connected to memgraph.")
                memgraph.drop_database()
        except:
            logger.info("Memgraph probably isn't running.")
            time.sleep(4)


class TweetStream(StreamingClient):

    def on_connect(self):
        logger.info("Connected")

    def on_tweet(self, tweet):
        logger.info("Tweet event")
        

    def on_response(self, response):
        try: 
            #TODO: Check way are there two authors? Co-authors maybe?
            tweet_data = {}
            tweet = response.data
            users = {u["id"]: u for u in response.includes["users"]}
            if users[tweet.author_id]:
                user = users[tweet.author_id]
                tweet_data= {
                    "id": tweet.id,
                    "text": tweet.text,
                    "created_at": str(tweet.created_at),
                    "participant_id": user.id,
                    "participant_name": user.name,
                    "participant_username": user.username,
                }

             #TODO: Make it to use query builder not OGM
            tweet_node = Tweet(
                id=tweet_data["id"],
                text=tweet_data["text"], 
                created_at=tweet_data["created_at"],
            )
            tweet_node = memgraph.save_node(tweet_node)

            participant_node = Participant(
                id=tweet_data["participant_id"],
                name=tweet_data["participant_name"],
                username=tweet_data["participant_username"],
                claimed=False,
            )
            participant_node = memgraph.save_node(participant_node)

            tweeted_rel = Tweeted(
                _start_node_id=participant_node._id,
                _end_node_id=tweet_node._id
            )

            memgraph.save_relationship(tweeted_rel)



        except Exception as e: 
            traceback.print_exc()

    def on_disconnect(self):
        logger.info("on_disconnect")
        pass

    def on_errors(self, errors):
        logger.info("on_errors")
        pass

    def on_exception(self, exception):
        logger.info("on_exception")
        pass

    def on_connection_error(self):
        logger.info("on_connection_error")
        pass

    def on_request_error(self, status_code):
        logger.info("on_request_error")
        pass
    
    def on_keep_alive(self):
        logger.info("on_keep_alive")
        pass



stream = TweetStream(
    bearer_token="AAAAAAAAAAAAAAAAAAAAAKn5gAEAAAAAjQNLQxHyBfc75fLQ43prf0rR7rQ%3DtLUVQHj6rNKmW6jYZXdtce7bsIVwYnjImuDnpudo68BeznND2s"
    )

def clear_rules():
    rules=stream.get_rules()
    for rule in rules.data:
        print(rule.id)
        stream.delete_rules(rule[2])

def init_stream():
    rules = stream.get_rules()
    if len(rules) == 0:
        print("setting rules")
        rule = StreamRule("#ronaldo -is:retweet")
        stream.add_rules(rule)
    print("Not setting rules")
    stream.filter(
        threaded=True,
        tweet_fields=["context_annotations", "created_at"],
        user_fields=["profile_image_url"],
        expansions=["author_id"],
        )
    # clear_rules()

connect_to_memgraph()
init_stream()

