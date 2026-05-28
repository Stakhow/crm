import type { ProductModifierItemDTO } from "../../../../dto/ProductModifierItemDTO";
import { AppError } from "../../../../utils/error";
import type { ProductCategory } from "../ProductCategory";
import type { IProductModifier } from "./IProductModifier";

export type ProductModifierProps = {
  id: string;
  name: string;
  categories: ProductCategory[];
  list: ProductModifierItemDTO[];
};

export class ProductModifier implements IProductModifier {
  private _list;

  constructor(
    readonly id: string,
    public name: string,
    public categories: ProductCategory[],
    public list: ProductModifierItemDTO[],
  ) {
    if (typeof id === undefined)
      throw new AppError("DOMAIN", "Не встановлено ID модифікатора");
    this.id = id;

    if (!name || !name.length)
      throw new AppError("DOMAIN", "Не встановлено назву модифікатора");

    this.validateName(name);
    this.name = this.applyName(name);

    this.validateCategories(categories);
    this.categories = categories;

    this.validateList(list);
    this._list = list;
    this.list = this._getList();
  }

  private validateName(name: string) {
    if (!name || !name.length)
      throw new AppError("DOMAIN", "Не встановлено назву модифікатора");
  }
  private validateCategories(categories: ProductCategory[]) {
    if (!categories.length || categories.some((i) => !i))
      throw new AppError("DOMAIN", "Не встановлено категорії модифікатора");
  }
  private validateList(list: ProductModifierItemDTO[]) {
    if (!list.length || list.some((i) => !i.name))
      throw new AppError("DOMAIN", "Помилка списку модифікатора");
  }

  private applyName(name: string) {
    return name.trim();
  }

  showFullData() {
    return {
      id: this.id,
      name: this.name,
      categories: this.categories,
      list: this._getList(),
    };
  }

  private _getList() {
    return this._list;
  }

  select(valueId: string) {
    const selectedList =
      typeof valueId !== "undefined"
        ? this._getList().filter((i) => i.id === valueId)
        : this._getList().filter((_, idx) => idx === 0);

    if (!selectedList.length)
      throw new AppError("DOMAIN", "Пустий список модифікатора");

    this.list = selectedList;
  }

  apply(price: number) {
    return this.list.reduce(
      (result, modifier) => Number(result) + Number(modifier.price),
      price,
    );
  }

  toDTO() {
    return { id: this.id, itemId: this.list[0].id };
  }

  toView() {
    return {
      title: this.name,
      valueId: (this.list.length > 0 && this.list[0].name) || "",
      price: (this.list.length > 0 && this.list[0].price) || 0,
    };
  }

  updateName(name: string): void {
    this.validateName(name);

    this.name = this.applyName(name);
  }

  updateList(list: ProductModifierItemDTO[]) {
    this.validateList(list);

    this.list = list.map((i) => {
      const item = this.list.find((item) => item.id === i.id);

      if (!!item) {
        item.name = this.applyName(i.name);
        item.price = i.price;
      }

      return i;
    });
  }

  updateCatergories(categories: ProductCategory[]) {
    this.validateCategories(categories);

    this.categories = categories;
  }
}
