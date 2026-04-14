import type { ProductModifierItemDTO } from "../../../../dto/ProductModifierItemDTO";
import { AppError } from "../../../../utils/error";
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
    if (typeof id === undefined)
      throw new AppError("DOMAIN", "Не встановлено ID модифікатора");
    if (!name || !name.length)
      throw new AppError("DOMAIN", "Не встановлено назву модифікатора");
    if (!category.length || category.some((i) => !i))
      throw new AppError("DOMAIN", "Не встановлено категорії модифікатора");

    if (!list.length || list.some((i) => !i.name))
      throw new AppError("DOMAIN", "Помилка списку модифікатора");

    this._list = list;
    this.list = this._getList();
  }
  showFullData() {
    return {
      id: this.id,
      name: this.name,
      category: this.category,
      list: this._getList(),
    };
  }

  private _getList() {
    return this._list;
  }

  select(value: number) {
    const selectedList =
      typeof value !== "undefined"
        ? this._getList().filter((i) => i.id === value)
        : this._getList().filter((_, idx) => idx === 0);

    if (!selectedList.length)
      throw new AppError("DOMAIN", "Пустий список модифікатора");

    this.list = selectedList;
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
