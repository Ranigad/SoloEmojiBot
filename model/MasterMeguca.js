class MasterMeguca {
    constructor(id, jpn_name, eng_sur, eng_given, nick, meguca_type, meguca) {
        this.id = id;
        this.jpn_name = jpn_name;
        this.eng_sur = eng_sur;
        this.eng_given = eng_given;
        this.nick = nick;
        this.meguca_type = meguca_type;
        this.meguca = meguca;
    }
}

module.exports = {
    MasterMeguca: MasterMeguca
};
