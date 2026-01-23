export class Category {
    constructor(id, name) {
        this.id = id;
        this.name = name;
    }
}

export default class CategoryManager {
    constructor() {
        this.categories = [
            new Category(0, "Film"),
            new Category(1, "Bag"),
            new Category(2, "Granule")
        ];
    }
    
    getById(id) {
        return this.categories.find(cat => cat.id === id);
    }
    
    getByName(name) {
        return this.categories.find(cat => cat.name === name);
    }
    
    addCategory(id, name) {
        const newCategory = new Category(id, name);
        this.categories.push(newCategory);
    }
    
    getAllNames() {
        return this.categories.map(cat => cat.name);
    }
}
