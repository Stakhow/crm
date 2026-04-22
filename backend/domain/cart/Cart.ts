import type { CartDTO } from "../../../dto/CartDTO";
import { AppError } from "../../../utils/error";

export type CartItemProps = {
  productId: number;
  name: string;
  price: number;
  quantity: number;
  total: number;
};

export class CartItem {
  constructor(
    public productId: number,
    public name: string,
    public price: number,
    private _quantity: number,
    public total: number,
  ) {}

  get quantity() {
    return this._quantity;
  }

  increase(qty: number) {
    this._quantity += qty;
  }

  decrease(qty: number) {
    this._quantity -= qty;
  }

  toPersistence() {
    return {
      productId: this.productId,
      name: this.name,
      price: this.price,
      quantity: this.quantity,
      total: this.total,
    };
  }
}

type ProductId = number;

export class Cart {
  private items = new Map<ProductId, CartItem>();
  private createdAt: number;
  public clientId: number;
  public id: number;

  constructor(
    id: number,
    items: CartItem[] = [],
    createdAt: number,
    clientId: number,
  ) {
    items.forEach((i) => this.items.set(i.productId, i));

    this.createdAt = createdAt;
    this.clientId = clientId ?? 0;
    this.id = id;
  }

  addItem(data: CartItemProps) {
    const existing = this.items.get(data.productId);

    if (!data.productId) throw new AppError("DOMAIN", "Продукт не вказано");

    if (data.quantity <= 0)
      throw new AppError("DOMAIN", "Вага/Кількість повинна бути більше нуля");

    if (existing) {
      existing.increase(data.quantity);
      return;
    }

    const item = new CartItem(
      data.productId,
      data.name,
      data.price,
      data.quantity,
      data.total,
    );

    this.items.set(data.productId, item);
  }

  removeItem(itemId: number) {
    this.items.delete(itemId);
  }

  getItems() {
    return [...this.items.values()];
  }

  getProductsId() {
    return this.getItems().map((i) => i.productId);
  }

  getItemsMap() {
    return this.items;
  }

  getItem(id: number) {
    return this.items.get(id);
  }

  get totalAmount() {
    return this.getItems().reduce((s, i) => s + i.total, 0);
  }

  get quantity() {
    return this.items.size;
  }

  clear() {
    this.items.clear();
  }

  set setClientId(clientId: number) {
    this.clientId = clientId;
  }

  toPersistent(): CartDTO {
    const productsIds: number[] = [];

    const items = this.getItems().map((i) => {
      
      productsIds.push(i.productId);

      return i.toPersistence();
    })

    return {
      id: this.id,
      items,
      quantity: this.quantity,
      createdAt: this.createdAt,
      clientId: this.clientId,
      totalAmount: this.totalAmount,
      productsIds,
    };
  }

  isValid(): boolean {
    return this.getItems().length > 0 && this.totalAmount > 0;
  }
}
