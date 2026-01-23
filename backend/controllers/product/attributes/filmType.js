export class FilmType {
    constructor(id, name) {
        this.id = id;
        this.name = name;
    }
}

export default class FilmTypeManager {
    constructor() {
        this.types = [
            new FilmType(0, "withPockets"),
            new FilmType(1, "withoutPockets"),
            new FilmType(2, "sideCut"),
            new FilmType(3, "bothSideCut"),
        ];
    }
    getById(id) {
        return this.types.find(i => i.id === id);
    }
}
