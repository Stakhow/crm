import { Order } from "./../../domain/order/Order";
import { IOrderRepository } from "./IOrderRepository";

export class OrderRepository implements IOrderRepository {
  constructor(private dbPromise: Promise<IDBDatabase>) {}

  async save(order: Order): Promise<void> {
    const db = await this.dbPromise;

    return new Promise((resolve, reject) => {
      const tx = db.transaction('orders', 'readwrite');
      const store = tx.objectStore('orders');

      store.put({
        ...order,
        createdAt: order.createdAt.toISOString(),
      });

      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async findAll(): Promise<Order[]> {
    const db = await this.dbPromise;

    return new Promise((resolve, reject) => {
      const tx = db.transaction('orders', 'readonly');
      const store = tx.objectStore('orders');
      const request = store.getAll();

      request.onsuccess = () => {
        resolve(
          request.result.map(
            (o) =>
              new Order(
                o.id,
                o.clientId,
                o.product,
                o.price,
                new Date(o.createdAt)
              )
          )
        );
      };

      request.onerror = () => reject(request.error);
    });
  }
}
