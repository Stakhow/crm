import type { IProductModifier } from "./modifiers/IProductModifier";
import type { ProductCategory } from "../../domain/product/ProductCategory";

export interface BaseProductProps {
  id?: string | number;
  category: ProductCategory;
  modifiers?: IProductModifier[];
  name: string;
  weight: number;
  price: number;
}

export abstract class BaseProduct {
  protected id?: string | number;
  protected category: ProductCategory;

  protected name: string;
  protected modifiers: IProductModifier[];
  protected weight: number;
  protected price: number;

  protected constructor(props: BaseProductProps) {
    this.id = props.id || "";
    this.category = props.category;
    this.name = props.name || "";
    this.weight = props.weight || 0;
    this.price = props.price || 0;
    this.modifiers = props.modifiers ?? [];
  }

  // get modifiers(): readonly IProductModifier[] {
  //   return this._modifiers;
  // }

  set setModifiers(value: IProductModifier[]) {
    this.modifiers = value;
  }

  // get weight(): number {
  //   return this._weight;
  // }

  // set weight(value: number) {
  //   if (value < 0) throw new Error("Weight must be positive");
  //   this._weight = value;
  // }

  // get price(): number {
  //   return this._price;
  // }

  // set price(value: number) {
  //   if (value < 0) throw new Error("Price must be positive");
  //   this._price = value;
  // }

  // get name(): string {
  //   return this._name;
  // }

  // set name(value: string) {
  //   this._name = value;
  // }

  abstract fillData(data: unknown): this;

  protected applyModifiers(): number {
    return this.modifiers.reduce(
      (price, modifier) => modifier.apply(price),
      this.price,
    );
  }

  getTotalPrice(): number {
    return Math.round(this.weight * this.applyModifiers());
  }
}
