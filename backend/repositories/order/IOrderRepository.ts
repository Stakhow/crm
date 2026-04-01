import type { OrderViewDTO } from "../../../dto/OrderViewDTO";
import { Order } from "../../domain/order/Order";

export interface IOrderRepository {
  save(order: Order): Promise<number>;
  update(order: Order): Promise<number>;
  getById(id: number): Promise<Order>;
  getAll(): Promise<Order[]>;
  getByClient(clientId: number): Promise<Order[]>;
}
