# TODO

#### General

- Set up Kuro bot to begin testing, initial version will only do wiki commands
- Privileges?

#### Wiki
- Move linking and title casing to wiki class
- Only allow addition of shortcuts if to a valid page

#### Emoji Parser
- Make more robust, flag based parsing to generate custom query

#### Twitterbot
- Figure out embeds and embed previews in Discord post

---

## Version 1.0 (6/10/18)
- Added messageid to database
- Reactional removal now removes entry from database

#### TODO Completed
- Decide where to store help text, in file or in mapping file
- **Archived** - Add a file to map valid commands to path.

---

## Version 0.4c (6/9/18)
- Added messageid to database
- Reactional removal now removes entry from database

#### TODO Completed
- On startup, parse since last tweet and post all missed tweets

---

## Version 0.4b (6/8/18)
- No longer stores <:name:id> format
- All lookups based on emoji's name in case emojis are removed / added
- Added default behavior of printing a list of nothing
- Generalized "GetEmoji" function in emoji.js to allow pass in of attribute to get.
- Added query by reaction
- Twitterbot now utilizes webhook, posts request directly from twitter streamer to channel
- Posts embed, looks nicer.
- Have the bot automatically remove emoji lists after certain amount of time (check with osa about features)


#### TODO Completed
- Alternative: Make python bot specific for twitter
- Add emoji counting for reactions, store in database source (reaction or message)
- **Archived** - Python Twitterbot pushing to firebase
- **Archived** - On twitterbot start, check firebase for last tweet and fetch all tweets since then.

---

## Version 0.4a (6/7/18)
- Store emojis in a database
- Wrote prototype versions of different queries
- Completed query, moved substitute to array parameterization
- Prototype for emoji printing
    - Successful test of emoji printing with 1 page of data
    - Successful test of emoji printing with 1 page of data for all queries

#### TODO Completed
- Query based on server, user, emoji
- Get print emojis working
- Create an emoji command which prints emojis and sends message with formatting

---

## Version 0.3 (5/28/18)

- Moved list of title capped words to a config json file, retained list as default.

### TODO Completed
- Move title caps list to config folder

---

## Version 0.2
- Test shortcut and magical girl search
- Prioritize normal madoka when searching for madoka/kaname
     - Consider moving order on list
- Change updateMegucaList to export to a file.
- Add matchMeguca to wlink
- Change wikicommands to get ServerID from message object rather than hardcode
- Add shortcut and magical girl functionality to wlink
    - Changed wiki.js matchMeguca to return array for title casing
- Attempted to move title case word list to a separate config file, needs testing
    - Will default to a hard coded list if none found
- Added skeleton EmojiParser.js for later completion.
    - Will push to a sqlite db with columns emojiname, emojiid, userid, serverid, and time.
    - parseMessage now calls dbadd
    - One lookup function, checks based on passed server or user ID and then prints emoji usage.
- Added initial WikiCommand extends BaseCommand.
    - Creating a group/subgroup/subfolder for wiki commands with shared properties, tentative, currently not in use.
-

#### TODO Completed
- Add shortcut and magical girl to wlink

---

## Version 0.1
- Began migration to modularized command format
- Created BaseCommand class
- Created CommandHandler class to parse messages and run relevant commands.
- Replicated the following commands:
    - wadd
    - wdelete
    - wlink (basic linking, no shortcuts or magical girl lookup)
        - wlink now has title case method to title case pages properly
    - wset
- Created wupdate - updates list of magical girls from wiki
- Created TestCommandHandler.js which runs a series of provided test messages received
- Replicated wikia.js to wiki.js but with slight rewritings to accomodate new commands

#### TODO Completed
- Migrated all basic wiki commands