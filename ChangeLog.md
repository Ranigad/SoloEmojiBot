# TODO

#### General

- Set up Kuro bot to begin testing, initial version will only do wiki commands
- Add a file to map valid commands to path.
- Decide where to store help text, in file or in mapping file
- Privileges?
- Have the bot automatically remove emoji lists after certain amount of time (check with osa about features)

#### Wiki
- Test shortcut and magical girl search
- Move title caps list to config folder
- Change wikicommands to get ServerID from message object rather than hardcode
- Prioritize normal madoka when searching for madoka/kaname
     - Consider moving order on list
- Add matchMeguca to wlink
- Change updateMegucaList to export to a file.

#### Emoji Parser
- Add emoji counting for reactions, store in database source (reaction or message)
- Get print emojis working
- Create an emoji command which prints emojis and sends message with formatting

#### Twitterbot
- Python Twitterbot pushing to firebase
- On twitterbot start, check firebase for last tweet and fetch all tweets since then.


---

## Version 0.2
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