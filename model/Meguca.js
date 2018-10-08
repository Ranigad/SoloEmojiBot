class Meguca {
    constructor(id, user_id, support_type, bonus, level, magia_level, revision, slots, masterMeguca, memes, user, attack, defense, hp) {
        this.id = id;
        this.support_type = support_type;
        this.bonus = bonus;
        this.level = level;
        this.magia_level = magia_level;
        this.revision = revision;
        this.slots = slots;
        this.masterMeguca = masterMeguca;
        this.memes = memes;
        this.user = user;
        this.attack = attack;
        this.defense = defense;
        this.hp = hp;
    }
}

module.exports = {
    Meguca: Meguca
};
