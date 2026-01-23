export class UnitType {
    constructor(id, name, unit, value = 0) {
        this.id = id;
        this.name = name;
        this.unit = unit;
        this.value = value;
    }
    
    setValue(value) {
        
        this.value = value;
        
        return this;
    }
}

export default class UnitTypeManager {
    constructor() {
        this.types = [
            new UnitType(0, 'weight', 'kg'),
            new UnitType(1, 'pieces', 'pcs'),
        ]
    }
    
    getById(id) {
        return this.types.find(t => t.id === id);
    }
    
    getByName(name) {
        return this.types.find(t => t.name === name);
    }
}

