class Friend {
    constructor(id, user_a, user_b, a_follows, b_follows) {
        this.id = id;
        this.user_a = user_a;
        this.user_b = user_b;
        this.a_follows = a_follows;
        this.b_follows = b_follows;
    }
}

module.exports = {
    Friend: Friend
};
