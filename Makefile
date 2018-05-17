REPORTER = list
MOCHA_OPTS = --ui bdd -c

db:
	echo Seeding blog-test *****************************************************
	./seed.sh
start:
	TWITTER_CONSUMER_KEY=AAAAAAAAAAAAAAAAAAAAA \
	TWITTER_CONSUMER_SECRET=BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB \
  NODE_ENV=development \
	node app.js

.PHONY: test db start