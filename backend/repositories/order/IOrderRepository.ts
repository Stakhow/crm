import type { OrderDTO } from "../../../dto/OrderDTO";
import { Order } from "../../domain/order/Order";

export interface IOrderRepository {
  save(order: Order): Promise<number>;
  // getById(id: string): Promise<Order | null>;
  findAll(): Promise<Order[]>;
}
