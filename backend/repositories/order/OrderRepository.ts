import { db } from "../../../config/db";
import { OrderDTO } from "../../../dto/OrderDTO";
import { Order } from "./../../domain/order/Order";
import type { IOrderRepository } from "./IOrderRepository";


export class OrderRepository implements IOrderRepository {
  
  async save(order: Order): Promise<number> {
    if(order.hasOwnProperty('id')) delete order.id;
    
    return await db.orders.put({
      ...order,
      createdAt: new Date().toISOString(),
    });
  }
  findAll(): Promise<Order[]> {
    return db.orders.toArray();
  }
}
