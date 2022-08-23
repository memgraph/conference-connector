from main import memgraph
from main import twitter_client, log
from datetime import datetime, timedelta
import traceback

hashtag = "#memgraph"

def twitter_api_helper():
    twitter_client.bearer_token = ""
    latest_tweets_with_hashtag(hashtag, days=1, hours=0)

    # id = user.data["id"]
    # tweets = twitter_client.get_users_tweets(id=id, tweet_fields=['context_annotations','created_at','geo'])

    # for tweet in tweets.data:
    #     print(tweets.data)
    #     print(tweet)

    
def latest_tweets_with_hashtag(hashtag: str, days: int = 0, hours: int = 1):
    try: 
        last_hour = datetime.utcnow() - timedelta(days=days, hours = hours)
        tweets = twitter_client.search_recent_tweets(query=hashtag + " -is:retweet", start_time=last_hour)
        for tweet in tweets.data:
            print(str(tweet.id) + tweet.text)
    except Exception as e: 
        traceback.print_exc()



twitter_api_helper()