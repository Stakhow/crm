import { BaseProduct, type BaseProductProps } from "../BaseProduct";
import type { IProductModifier } from "../modifiers/IProductModifier";

export interface BagProps extends BaseProductProps {}

export class Bag extends BaseProduct {
  private length: number;
  private thickness: number;
  private quantity: number;
  private width: number;

  constructor(props: BagProps) {
    super(props);

    this.width = 0;
    this.length = 0;
    this.thickness = 0;
    this.quantity = 0;
  }

  set setName(name: string) {
    this.name = name;
  }

  set setLength(v: number) {
    this.length = v;
  }
  set setWidth(v: number) {
    this.width = v;
  }
  set setThickness(v: number) {
    this.thickness = v;
  }

  set setQuantity(v: number) {
    this.quantity = v;
  }

  fillData(data: {}): ThisType<Bag> {
    this.setName = data.name;
    this.setWidth = data.width;
    this.setLength = data.length;
    this.setThickness = data.thickness;
    this.setQuantity = data.quantity;
    
    return this;
  }

  getTotalPrice(): number {
    return +(this.getWeight() * this.applyModifiers()).toFixed();
  }

  getWeight(): number {
    if (
      this.length > 0 &&
      this.width > 0 &&
      this.thickness > 0 &&
      this.quantity > 0
    )
      return Number(
        (
          this.length *
          0.01 *
          this.width *
          0.01 *
          (this.thickness * 0.001 * 2 * this.quantity)
        ).toFixed(3),
      );
    else return 0;
  }
}
