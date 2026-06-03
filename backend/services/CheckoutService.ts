import { db } from "../../config/db";
import { Order } from "../domain/order/Order";
import { OrderRepository } from "../repositories/OrderRepository";
import { globalEventBus } from "../shared/EventBus";
import { CartService } from "./CartService";

export class CheckoutService {
  constructor(
    private orderRepository: OrderRepository,
    private cartService: CartService,
  ) {}

  async commitOrder(order: Order, cartId: string): Promise<string> {
    return db.transaction(
      "rw",
      [
        db.orders,
        db.order_items,
        db.products,
        db.products_reserve,
        db.products_to_produce,
        db.cart,
        db.cart_items,
      ],
      async () => {
        await this.orderRepository.save(order);

        await this.cartService.deleteCart(cartId);

        await globalEventBus.publishFromAggregate(order);

        return order.id;
      },
    );
  }
}
