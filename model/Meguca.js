class Meguca {
    constructor(id, user_id, support_type, bonus, level, magia_level, revision, slots, masterMeguca, memes) {
        this.id = id;
        this.user_id = user_id;
        this.support_type = support_type;
        this.bonus = bonus;
        this.level = level;
        this.magia_level = magia_level;
        this.revision = revision;
        this.slots = slots;
        this.masterMeguca = masterMeguca;
        this.memes = memes;
    }
}

module.exports = {
    Meguca: Meguca
};
