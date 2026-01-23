export class Material {
    constructor(id, name) {
        this.id = id;
        this.name = name;
    }
}

export default class MaterialsManager {
    constructor() {
        this.materials = [
            new Material(0, 'polyethylene'),
            new Material(1, 'stretch'),
        ]
    }
    
    getById (id) {
        return this.materials.find(m => m.id === id);
    }
    
    getByName (name) {
        return this.materials.find(m => m.name === name);
    }
}
