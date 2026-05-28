import { type ProductCategory } from "../../domain/product/ProductCategory";
import { AppError } from "../../../utils/error";
import type { ProductDataDTO } from "../../../dto/ProductDataDTO";

import type { ProductViewDTO, UnitType } from "./../../../dto/ProductViewDTO";
import type { CreateProductFieldsDTO } from "../../../dto/ProductToCreateDTO";

export interface BaseProductProps {
  id: string;
  createdAt: number;
  updatedAt: number;
  name: string;
  quantity: number;
  price: number;
  categoryName: ProductCategory;
}

export abstract class BaseProduct<C extends ProductCategory> {
  abstract readonly categoryName: C;

  public readonly id: string;
  public readonly unit: UnitType = "kilogram";

  protected readonly createdAt: number;
  protected readonly updatedAt: number;

  protected _name: string = "";
  protected _quantity: number = 0;

  protected _price: number = 0;

  protected constructor(props: BaseProductProps) {
    this.id = props.id;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;

    this.name = props.name;

    this.quantity = props.quantity;
    this.price = props.price;
  }

  set name(value: string) {
    if (!value.trim()) {
      throw new AppError("DOMAIN", "Назву не вказано");
    }

    this._name = value.trim();
  }

  get name() {
    return this._name;
  }

  get totalAmount() {
    return Number((this.weight * this.price).toFixed(2));
  }

  get weight() {
    return this.quantity;
  }

  set quantity(value: number) {
    if (value < 0)
      throw new AppError("DOMAIN", "Кількість не може бути нижче нуля");

    this._quantity = value;
  }

  get quantity() {
    return this._quantity;
  }

  set price(value: number) {
    if (value <= 0) {
      throw new AppError("DOMAIN", `Ціна має бути більше нуля`);
    }

    const oldPrice = this._price;

    if (oldPrice !== 0 && oldPrice !== value) {
      this.addDomainEvent({
        type: "PRODUCT_PRICE_CHANGED",
        payload: { productId: this.id, price: value },
      });
    }

    this._price = value;
  }

  get price(): number {
    return this._price;
  }

  isValid(): boolean {
    const isValid = this.quantity >= 0 && this._price > 0;
    if (!isValid) throw new AppError("DOMAIN", "Ціна не вказана");

    return isValid;
  }

  get pricePerUnit(): number {
    if (this.quantity === 0) return 0;

    const res = Number((this.totalAmount / this.quantity).toFixed(2));

    if (Number.isNaN(res)) {
      throw new AppError("DOMAIN", "Помилка обчислення ціни за одиницю");
    }

    return res;
  }

  get weightPerUnit(): number {
    if (this.quantity === 0) return 0;

    const res = Number((this.weight / this.quantity).toFixed(3));

    if (Number.isNaN(res)) {
      throw new AppError("DOMAIN", "Помилка обчислення ваги за одиницю");
    }

    return res;
  }

  abstract toPersistence(): ProductDataDTO;

  getFields() {
    return {
      name: this.name,
      price: this.price,
      quantity: this.quantity,
      weightPerUnit: this.weightPerUnit,
      pricePerUnit: this.pricePerUnit,
    };
  }

  static get fieldsToCreate(): CreateProductFieldsDTO {
    return {
      name: "",
      price: 0,
      quantity: 0,
    };
  }

  toView(): ProductViewDTO {
    return {
      id: this.id,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      name: this._name,
      categoryName: this.categoryName,
      quantity: this.quantity,
      weight: this.weight,
      price: this.price,
      totalAmount: this.totalAmount,
      isAvailable: this.isAvailable(),
      fields: this.getFields(),
      unit: this.categoryName === "bag" ? "piece" : "kilogram",
    };
  }

  increaseQuantity(quantity: number) {
    this.quantity = this.quantity + Number(quantity);
  }

  decreaseQuantity(quantity: number) {
    this.quantity = this.quantity + Number(quantity);
  }

  isAvailable() {
    return this.quantity > 0;
  }

  private domainEvents: any[] = [];

  protected addDomainEvent(event: any): void {
    this.domainEvents.push(event);
  }

  public pullDomainEvents(): any[] {
    const events = [...this.domainEvents];
    this.domainEvents = [];
    return events;
  }
}
