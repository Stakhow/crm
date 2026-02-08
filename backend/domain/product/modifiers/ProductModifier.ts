import type { ProductModifierItemDTO } from "../../../../dto/ProductModifierItemDTO";
import type { IProductModifier } from "./IProductModifier";

export class ProductModifier implements IProductModifier {
  list;

  constructor(
    readonly id: string,
    readonly name: string,
    readonly title: string,
    readonly category: string[],
    list: ProductModifierItemDTO[],
  ) {
    this.list = list;
  }

  apply(price: number): number {
    return this.list.reduce(
      (result, modifier) => result + modifier.price,
      price,
    );
  }
}
