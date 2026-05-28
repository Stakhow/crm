import { db } from "../../../config/db";
import type { BaseProduct } from "../../domain/product/BaseProduct";
import { Order } from "../../domain/order/Order";
import type { IOrderRepository } from "./IOrderRepository";

import type { OrderDB, OrderItemDB } from "../../../config/db.types";
import { AppError } from "../../../utils/error";
import type { ProductCategory } from "../../domain/product/ProductCategory";

function groupByOrderId(items: OrderItemDB[]) {
  const map = new Map<number, OrderItemDB[]>();

  for (const item of items) {
    if (!map.has(item.orderId)) {
      map.set(item.orderId, []);
    }
    map.get(item.orderId)!.push(item);
  }

  return map;
}

function getDayRange(timestamp: number) {
  const date = new Date(timestamp);

  const start = new Date(date);
  start.setHours(0, 0, 0, 0);

  const end = new Date(date);
  end.setHours(23, 59, 59, 999);

  return { start: start.getTime(), end: end.getTime() };
}

function getMonthRange(timestamp: number) {
  const date = new Date(timestamp);

  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(
    date.getFullYear(),
    date.getMonth() + 1,
    0,
    23,
    59,
    59,
    999,
  );

  return { start: start.getTime(), end: end.getTime() };
}

export class OrderRepository implements IOrderRepository {
  async save(
    order: Order,
    products: BaseProduct<ProductCategory>[],
  ): Promise<string> {
    return db.transaction(
      "rw",
      db.products,
      db.orders,
      db.order_items,
      async () => {
        await db.products.bulkUpdate(
          order.items.map((i) => {
            i.productId;

            const product = products.find((p) => p.id === i.productId);

            if (!product)
              throw new AppError("DOMAIN", "Не знайдено відповідного продукту");

            product.decreaseQuantity(i.quantity);

            return {
              key: product.id,
              changes: { quantity: product.quantity },
            };
          }),
        );

        const orderId = await db.orders.add(order.toSaveDB());

        await db.order_items.bulkAdd(order.toSaveItemsDB());

        return orderId;
      },
    );
  }

  async update(order: Order): Promise<string> {
    await db.orders.update(order.id, order.toSaveDB());

    return order.id;
  }

  async getById(id: string): Promise<Order> {
    const orderDTO = await db.orders.get(id);
    if (!orderDTO) throw new AppError("SERVICE", "Замовлення не знайдено");

    const items = await db.order_items.where("orderId").equals(id).toArray();
    return this.toDomain(orderDTO, items);
  }

  async getAll(): Promise<Order[]> {
    const orders = await db.orders.reverse().toArray();
    return this.buildOrders(orders);
  }

  async getByClient(clientId: string): Promise<Order[]> {
    const orders = await db.orders
      .where("clientId")
      .equals(clientId)
      .reverse()
      .toArray();

    return this.buildOrders(orders);
  }

  async getAllByTargetDate(timestamp: number): Promise<Order[]> {
    const { start, end } = getDayRange(timestamp);

    const orders = await db.orders
      .where("deadline")
      .between(start, end)
      .reverse()
      .toArray();

    return this.buildOrders(orders);
  }

  async getAllByMonth(timestamp: number): Promise<Order[]> {
    const { start, end } = getMonthRange(timestamp);

    const orders = await db.orders
      .where("deadline")
      .between(start, end)
      .reverse()
      .toArray();

    return this.buildOrders(orders);
  }

  private async buildOrders(orders: OrderDB[]): Promise<Order[]> {
    if (!orders.length) return [];

    const items = await db.order_items
      .where("orderId")
      .anyOf(orders.map((i) => i.id!))
      .toArray();

    const grouped = groupByOrderId(items);

    return orders.map((order) =>
      this.toDomain(order, grouped.get(order.id!) || []),
    );
  }

  private toDomain(order: OrderDB, items: OrderItemDB[]): Order {
    return new Order(
      order.id!,
      order.client,
      items.map((i) => i.data),
      order.totalAmount,
      order.quantity,
      order.status,
      order.deadline,
      order.createdAt,
      order.amountPaid,
    );
  }
}
