import type { ProductModifierItemDTO } from "../../../../dto/ProductModifierItemDTO";
import type { ProductCategory } from "../ProductCategory";
import type { IProductModifier } from "./IProductModifier";

export class ProductModifier implements IProductModifier {
  private _list;

  constructor(
    readonly id: number,
    readonly name: string,
    readonly category: ProductCategory[],
    public list: ProductModifierItemDTO[],
  ) {
    this._list = list;
    this.list = this.getList();
  }
  showFullData() {
    return {
      id: this.id,
      name: this.name,
      category: this.category,
      list: this.list,
    };
  }

  private getList() {
    return this._list;
  }

  select(value: number) {
    this.list = this.getList().filter((i) => i.id === value);
  }

  apply(price: number) {
    return this.list.reduce(
      (result, modifier) => result + modifier.price,
      price,
    );
  }

  toDTO() {
    return { id: this.id, itemId: this.list[0].id };
  }

  toView() {
    return {
      title: this.name,
      value: (this.list.length > 0 && this.list[0].name) || "",
      price: (this.list.length > 0 && this.list[0].price) || 0,
    };
  }
}
