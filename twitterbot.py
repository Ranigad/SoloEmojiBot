from tweepy import API, TweepError
from tweepy import Stream
from tweepy import OAuthHandler
from tweepy.streaming import StreamListener
from dotenv import load_dotenv, find_dotenv
from os import environ
import sys

# environment variables in os.environ.get(...)
load_dotenv(find_dotenv())
CONSUMER_KEY = environ.get("TWITTER_CONSUMER_KEY")
CONSUMER_SECRET = environ.get("TWITTER_CONSUMER_SECRET")
ACCESS_TOKEN_KEY = environ.get("TWITTER_ACCESS_TOKEN")
ACCESS_TOKEN_SECRET = environ.get("TWITTER_ACCESS_TOKEN_SECRET")

# Config
users = ["magireco"]

class StdOutListener(StreamListener):
    #def on_connect(self):
        #print("Listening to tweets")

    def on_status(self, status):
        #print("status | " + status.text)
        # only save if exists and from magireco twitter
        if status and status.user.id_str in user_ids:
            print(str(status.text) + "\n\n<https://twitter.com/statuses/" + status.id_str + "> \n---\n")
            sys.stdout.flush()

    def on_error(self, status_code):
        #print("Error: Connection Error " + str(status_code))
        if status_code == 420:
            return False


if __name__ == "__main__":
    listener = StdOutListener()
    auth = OAuthHandler(CONSUMER_KEY, CONSUMER_SECRET)
    auth.set_access_token(ACCESS_TOKEN_KEY, ACCESS_TOKEN_SECRET)
    api = API(auth)

    #try:
    user_ids = list(map(lambda u: u.id_str, map(api.get_user, users)))
    #except TweepError as err:
    #    print("Error: User does not exist: " + err)

    stream = Stream(auth, listener)
    stream.filter(follow=user_ids, async=True)

    #print("Listening to tweets")
