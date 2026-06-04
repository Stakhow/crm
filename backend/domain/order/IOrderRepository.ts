import type { OrderQuery } from "../../../dto/OrderQuery";
import { Order } from "../../domain/order/Order";

export interface IOrderRepository {
  save(order: Order): Promise<string>;
  update(order: Order): Promise<string>;
  getById(id: string): Promise<Order>;
  getAll(query?: OrderQuery): Promise<Order[]>;
  getByClient(clientId: string): Promise<Order[]>;
}
