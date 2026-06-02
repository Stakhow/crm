import type { CartDB, CartItemDB } from "../../../config/db.types";
import { AppError } from "../../../utils/error";
import { generateId } from "../../../utils/utils";

export type CartItemProps = {
  productId: string;
  quantity: number;
};

class CartItem {
  public productId: string;
  private _quantity: number = 0;

  constructor(data: CartItemProps) {
    if (!data.productId)
      throw new AppError("DOMAIN", "Товарну позицію не вказано");
    this.productId = data.productId;

    this.quantity = data.quantity;
  }

  set quantity(quantity: number) {
    if (Number.isNaN(quantity) || quantity <= 0)
      throw new AppError("DOMAIN", "Вага/Кількість повинна бути більше нуля");

    this._quantity = quantity;
  }

  get quantity() {
    return this._quantity;
  }

  increase(qty: number) {
    this.quantity = this.quantity += qty;
  }

  decrease(qty: number) {
    this.quantity = this.quantity -= qty;
  }

  toPersistence() {
    return {
      productId: this.productId,
      quantity: this.quantity,
    };
  }
}

type ProductId = string;

export class Cart {
  private items: Map<ProductId, CartItem> = new Map();
  private createdAt: number;
  public id: string;

  constructor(id: string, items: CartItem[] = [], createdAt: number) {
    items.forEach((i) => this.items.set(i.productId, i));

    if (!id) throw new AppError("DOMAIN", "Не вказано ID корзини");
    this.id = id;

    this.createdAt = createdAt;
  }

  addItem(data: CartItemProps) {
    const existing = this.items.get(data.productId);

    if (existing) {
      existing.increase(data.quantity);
      return;
    }

    const item = new CartItem(data);

    this.items.set(data.productId, item);
  }

  removeItem(itemId: string) {
    this.items.delete(itemId);

    return itemId;
  }

  getItems() {
    return [...this.items.values()];
  }

  getProductsId() {
    console.log(
      "getProductsId",
      this.getItems().map((i) => i.productId),
    );
    return this.getItems().map((i) => i.productId);
  }

  getItemsMap() {
    return this.items;
  }

  getItem(id: string) {
    return this.items.get(id);
  }

  get quantity() {
    return this.items.size;
  }

  clear() {
    this.items.clear();
  }

  toPersistent() {
    const items = this.getItems().map((i) => i.toPersistence());

    return {
      id: this.id,
      items,
      quantity: this.quantity,
      createdAt: this.createdAt,
    };
  }

  toDB(): CartDB {
    return {
      id: this.id,
      createdAt: this.createdAt,
    };
  }

  cartItemsToDB(): CartItemDB[] {
    const items = this.getItems().map((i) => ({
      ...i.toPersistence(),
      id: generateId(),
      cartId: this.id,
    }));

    if (!items.length)
      throw new AppError("DOMAIN", "Неможливо зберегти пусту корзину");

    return items;
  }
}
