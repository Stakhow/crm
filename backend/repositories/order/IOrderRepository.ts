import { Order } from "../../domain/order/Order";

export interface IOrderRepository {
  save(order: Order): Promise<void>;
  // getById(id: string): Promise<Order | null>;
  findAll(): Promise<Order[]>;
}
