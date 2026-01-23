// Abstract Class Product
import UnitTypeManager from "./attributes/unitType.js";
import ColorManager from "./attributes/color.js";
import CategoryManager from "./attributes/category.js";
import MaterialsManager from "./attributes/material.js";

export default class Product {
    constructor({id, name, price, categoryId = 0, materialId = 0, unitId = 0, unitValue, colorId}) {
        
        if (new.target === Product) { // Checks if Product was directly instantiated
            throw new Error("Cannot instantiate abstract class Product directly.");
        }
        
        this.id = id;
        this.name = name;
        this.price = price;
        
        this.units = new UnitTypeManager().getById(unitId).setValue(unitValue);
        this.color = new ColorManager().getById(colorId);
        this.category = new CategoryManager().getById(categoryId);
        this.material = new MaterialsManager().getById(materialId);
    }
}
