class MagiRecoUser {
    constructor(user_id, friend_id, display_name, user_rank, class_rank, last_access, comment, addtimestamp, updatetimestamp, meguca) {
        this.user_id = user_id;
        this.friend_id = friend_id;
        this.displayname = display_name;
        this.user_rank = user_rank;
        this.class_rank = class_rank;
        this.last_access = last_access;
        this.comment = comment;
        this.addtimestamp = addtimestamp;
        this.updatetimestamp = updatetimestamp;
        this.meguca = meguca;
    }
}

module.exports = {
    MagiRecoUser: MagiRecoUser
};
