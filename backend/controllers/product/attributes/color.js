export class Color {
    constructor(id, name, hex) {
        this.id = id;
        this.name = name;
        this.hex = hex;
    }
}

export default class ColorManager {
    constructor() {
        this.colors = [
            new Color(0, 'white', '#ffffff'),
            new Color(1, 'black', '#000000'),
            new Color(2, 'red', '#ff0000'),
        ]
    }
    
    getById (id) {
        return this.colors.find(c => c.id === id);
    }
    
    getByName (name) {
        return this.colors.find(c => c.name === name);
    }
    
    getByHex (hex) {
        return this.colors.find(c => c.hex === hex);
    }
}
