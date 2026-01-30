import { Category } from "./attributes/category";
import MaterialsManager from "./attributes/material";
import { Color } from "./attributes/color";
import { UnitType } from "./attributes/unitType";

export type TProduct = {
  id: string;
  name: string;
  category: Category;
  material: MaterialsManager;
  colors: Color[];
  units: UnitType[];
};

export default class Product {
  id;
  name;
  category;
  material;
  colors;
  units;

  constructor({ id, name, material, category, colors, units }: TProduct) {

    // if (new.target === Product) {
    //   // Checks if Product was directly instantiated
    //   throw new Error("Cannot instantiate abstract class Product directly.");
    // }

    this.id = id;
    this.name = name;
    this.category = category;
    this.material = material;
    this.colors = colors;
    this.units = units;
    
  }

  getPrices() {
    return this.material.list.map((i) => i.price);
  }
}
