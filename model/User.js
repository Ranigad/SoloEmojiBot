class User {
    constructor(username, name, discriminator, displayname, friend_id, notifications, addtimestamp) {
        this.username = username;
        this.discordname = name;
        this.discriminator = discriminator;
        this.displayname = displayname;
        this.friend_id = friend_id;
        this.notifications = notifications;
        this.addtimestamp = addtimestamp;
    }
}

module.exports = {
    User: User
};
