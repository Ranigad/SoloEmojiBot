
# Mokyuubot

A bot for the PMMM: Magia Record Discord.

## Setup

Recommended NodeJS version: 10.11.0

* `npm i`
* `npm i sqlite3`

### Environment Variables

Put these in a `[.env](https://www.npmjs.com/package/dotenv)` file.

#### Required

* `DISCORD_TOKEN` - needed to connect to Discord.
* `TEST_SERVER` - the ID of any Discord server to use for testing.

#### Optional

* `DISCORD_PREFIX` - the command prefix for each command. Defaults to `;`.
* `USER_ID` - a valid Magia Record user id. Required for X, Y, Z.
* `PROD_SERVER` - the ID of any Discord server to use as production.
* `LOG_CHANNEL` - the ID of a channel to spit out logs to.
* `IGNORE_PRESENCE` - if set, will not set Discord presence.
* `EMOJI_SERVER` - if set, will specifically use this server for emoji. Defaults to `TEST_SERVER`.

## Running The Bot

`npm start`

## TODO

### General

- Set up Kuro bot to begin testing, initial version will only do wiki commands
- Privileges?

### Wiki
- Move linking and title casing to wiki class
- Only allow addition of shortcuts if to a valid page

### Emoji Parser
- Make more robust, flag based parsing to generate custom query

### Twitterbot
- Figure out embeds and embed previews in Discord post