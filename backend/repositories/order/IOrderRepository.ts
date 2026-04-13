import { Order } from "../../domain/order/Order";
import type { BaseProduct } from "../../domain/product/BaseProduct";

export interface IOrderRepository {
  save(order: Order, products: BaseProduct[]): Promise<number>;
  update(order: Order): Promise<number>;
  getById(id: number): Promise<Order>;
  getAll(): Promise<Order[]>;
  getByClient(clientId: number): Promise<Order[]>;
}
