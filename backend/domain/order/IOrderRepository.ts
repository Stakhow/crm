import { Order } from "../../domain/order/Order";

export interface IOrderRepository {
  save(order: Order): Promise<string>;
  update(order: Order): Promise<string>;
  getById(id: string): Promise<Order>;
  getAll(): Promise<Order[]>;
  getByClient(clientId: string): Promise<Order[]>;
}
