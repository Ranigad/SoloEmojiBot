class MasterMemoria {
    constructor(id, jpn_name, eng_name, active, rating, memes) {
        this.jpn_name = jpn_name;
        this.eng_name = eng_name;
        this.active = active;
        this.rating = rating;
        this.memes = memes;
    }
}

module.exports = {
    MasterMemoria: MasterMemoria
};
