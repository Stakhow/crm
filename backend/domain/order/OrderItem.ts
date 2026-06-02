import type { ProductUnitType } from "../../../dto/ProductViewDTO";
import type { ProductCategory } from "../product/ProductCategory";

export type OrderItemProp = {
  id: string;
  productId: string;
  name: string;
  category: ProductCategory;
  quantity: number;
  price: number;
  totalAmount: number;
  unit: ProductUnitType;
};

export class OrderItem {
  public readonly id: string = "";
  public readonly productId: string = "";
  public readonly name: string = "";
  public readonly category: ProductCategory;
  public readonly quantity: number = 0;
  public readonly price: number = 0;
  public readonly totalAmount: number = 0;
  public readonly unit: ProductUnitType = "kilogram";

  constructor(data: OrderItemProp) {
    this.id = data.id;
    this.productId = data.productId;
    this.name = data.name;
    this.category = data.category;
    this.quantity = data.quantity;
    this.price = data.price;
    this.totalAmount = data.totalAmount;
    this.unit = data.unit;
  }

  toViewItem() {
    return {
      id: this.id,
      productId: this.productId,
      name: this.name,
      category: this.category,
      quantity: this.quantity,
      price: this.price,
      totalAmount: this.totalAmount,
      unit: this.unit,
    };
  }
}
