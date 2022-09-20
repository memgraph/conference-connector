from tweepy import StreamingClient, StreamRule
from gqlalchemy import Create, Match
from models import memgraph, Participant, Tweet, TweetedBy
from collections import deque
import logging
import traceback

logging.config.fileConfig('./logging.ini', disable_existing_loggers=False)
log = logging.getLogger(__name__)

tweets_backlog = deque()
participants_backlog = deque()


class TweetStream(StreamingClient):
    def on_connect(self):
        log.info("Connected to stream.")

    def on_tweet(self, tweet):
        log.info("New tweet event.")

    def on_response(self, response):
        log.info("Handling tweet event response.")
        try:
            tweet_data = {}
            tweet = response.data
            users = {u["id"]: u for u in response.includes["users"]}
            if users[tweet.author_id]:
                user = users[tweet.author_id]
                tweet_data = {
                    "id": tweet.id,
                    "text": tweet.text,
                    "created_at": str(tweet.created_at),
                    "participant_id": user.id,
                    "participant_name": user.name,
                    "participant_username": user.username,
                    "participant_image": user.profile_image_url,
                }
            log.info(tweet_data)
            tweet_node = Tweet(
                id=tweet_data["id"],
                text=tweet_data["text"],
                created_at=tweet_data["created_at"],
            )
            tweet_node = memgraph.save_node(tweet_node)
            
            participant_node = Participant(
                    id=tweet_data["participant_id"],
                    name=tweet_data["participant_name"],
                    username=tweet_data["participant_username"].lower(),
                    profile_image=tweet_data["participant_image"],
            )
            log.info("Match")

            results = list(
                Match()
                .node(labels="Participant", username=participant_node.username, variable="n")
                .return_()
                .execute()
            )
            
            if results:
                participant_node = participant_node.load(memgraph)
            else:
                participant_node = memgraph.save_node(participant_node)
        
            tweeted_rel = TweetedBy(
                _start_node_id=tweet_node._id, _end_node_id=participant_node._id
            )
            try:
                   tr = tweeted_rel.load(memgraph)
                   pass
            except:
                    memgraph.save_relationship(tweeted_rel)

            participant = {
                "id": participant_node._id,
                "label": next(iter(participant_node._labels)),
                "p_id": participant_node._properties["id"],
                "name": participant_node._properties["name"],
                "username": participant_node._properties["username"].lower(),
                "image": participant_node._properties["profile_image"],
                "claimed": participant_node._properties["claimed"],
            }

            tweet = {
                "id": tweet_node._id,
                "label": next(iter(tweet_node._labels)),
                "t_id": tweet_node._properties["id"],
                "text": tweet_node._properties["text"],
                "created_at": tweet_node._properties["created_at"],
            }

            tweeted = {
                "id": tweeted_rel._id,
                "start": tweeted_rel._start_node_id,
                "end": tweeted_rel._end_node_id,
                "label": tweeted_rel._type,
            }

            tweets_backlog.appendleft(tweet)
            participants_backlog.appendleft(participant)

        except Exception as e:
            log.error(e, exc_info=True)

    def on_disconnect(self):
        log.info("on_disconnect")
        pass

    def on_errors(self, errors):
        log.info("on_errors")
        pass

    def on_exception(self, exception):
        log.info("on_exception")
        pass

    def on_connection_error(self):
        log.info("on_connection_error")
        pass

    def on_request_error(self, status_code):
        log.info("on_request_error")
        pass

    def on_keep_alive(self):
        log.info("on_keep_alive")
        pass


stream = TweetStream(bearer_token=None)


def clear_rules():
    log.info("Clearing all the rules.")
    rules = stream.get_rules()
    if rules.data is not None:
        for rule in rules.data:
            stream.delete_rules(rule[2])
    else:
        log.info("No rules to delete!")


def rules_init(twitter_rule: str):
    rules = stream.get_rules()
    if rules.data == None:
        log.info("Setting streaming rules.")
        rule = StreamRule(twitter_rule)
        stream.add_rules(rule)
        log.info(rule)
    else:
        log.info("Following rules set: ")
        for rule in rules.data:
            log.info(rule)


def init_stream(bearer_token: str, twitter_rule: str):
    stream.bearer_token = bearer_token
    clear_rules()
    rules_init(twitter_rule)

    stream.filter(
        threaded=True,
        tweet_fields=["context_annotations", "created_at"],
        user_fields=["profile_image_url"],
        expansions=["author_id"],
    )


def close_stream():
    stream.disconnect()
