class Friend {
    constructor(id, user_a, user_b, friends) {
        this.id = id;
        this.user_a = user_a;
        this.user_b = user_b;
        this.friends = friends;
    }
}

module.exports = {
    Friend: Friend
};
