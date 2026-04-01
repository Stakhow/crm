import { db } from "../../../config/db";

import { Order } from "./../../domain/order/Order";
import type { IOrderRepository } from "./IOrderRepository";

export class OrderRepository implements IOrderRepository {
  async save(order: Order): Promise<number> {
    const orderId = await db.orders.add({
      client: order.client,
      clientId: order.client.id,
      totalAmount: order.totalAmount,
      quantity: order.quantity,
      status: order.status,
      createdAt: order.createdAt,
    });

    await db.order_items.bulkAdd(
      order.items.map((i) => ({
        orderId,
        productId: i.id,
        data: i,
      })),
    );

    return orderId;
  }

  async update(order: Order): Promise<number> {
    return await db.orders.update(order.id, {
      status: order.status,
    });
  }

  async getById(id: number): Promise<Order> {
    const orderDTO = await db.orders.get(id);
    const orderItemsDTO = await db.order_items
      .where("orderId")
      .equals(id)
      .toArray();

    return new Order(
      orderDTO.id,
      orderDTO.client,
      orderItemsDTO.map((i) => i.data),
      orderDTO.totalAmount,
      orderDTO.quantity,
      orderDTO.status,
      orderDTO.createdAt,
    );
  }

  async getAll(): Promise<Order[]> {
    const ordersDTO = await db.orders.toArray();

    return ordersDTO.map(
      (i) =>
        new Order(
          i.id,
          i.client,
          i.items,
          i.totalAmount,
          i.quantity,
          i.status,
          i.createdAt,
        ),
    );
  }

  async getByClient(clientId: number): Promise<Order[]> {
    const ordersDTO = await db.orders
      .where("clientId")
      .equals(clientId)
      .toArray();

    return ordersDTO.map(
      (i) =>
        new Order(
          i.id,
          i.client,
          i.items,
          i.totalAmount,
          i.quantity,
          i.status,
          i.createdAt,
        ),
    );
  }
}
