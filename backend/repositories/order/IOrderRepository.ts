import { Order } from "../../domain/order/Order";
import type { BaseProduct } from "../../domain/product/BaseProduct";
import type { ProductCategory } from "../../domain/product/ProductCategory";

export interface IOrderRepository {
  save(order: Order, products: BaseProduct<ProductCategory>[]): Promise<string>;
  update(order: Order): Promise<string>;
  getById(id: string): Promise<Order>;
  getAll(): Promise<Order[]>;
  getByClient(clientId: string): Promise<Order[]>;
}
