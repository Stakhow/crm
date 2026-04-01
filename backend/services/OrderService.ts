import { AppError } from "../../utils/error";

import type { OrderRepository } from "../repositories/order/OrderRepository";
import type { CartService } from "./CartService";

import type { ClientService } from "./ClientService";

import { Order, type Status } from "../domain/order/Order";
import type { OrderViewDTO } from "../../dto/OrderViewDTO";

export class OrderService {
  private status: "InProgress" | "Done" | "Cancelled" = "InProgress";

  constructor(
    private orderRepository: OrderRepository,
    private cartService: CartService,
    private clientService: ClientService,
  ) {}

  async createOrder() {
    const cart = await this.cartService.getCart();

    if (!cart.isValid()) throw new AppError("SERVICE", "Помилка корзини");

    const cartToView = await this.cartService.getCartToView();
    const client = await this.clientService.getById(cart.clientId);

    const orderId = await this.orderRepository.save(
      new Order(
        null,
        {
          id: client.id,
          name: client.name,
          phone: client.phone,
        },
        cartToView.products,
        cartToView.totalAmount,
        cartToView.quantity,
        this.status,
        new Date().toISOString(),
      ),
    );

    await this.cartService.resetCart();

    return orderId;
  }

  async updateStatus(id: number, status: Status): Promise<number> {
    const order = await this.orderRepository.getById(id);

    if (status) order.updateStatus(status);

    return await this.orderRepository.update(order);
  }

  async getById(id: number): Promise<OrderViewDTO> {
    const order = await this.orderRepository.getById(id);

    return order.toView();
  }

  async getAll(): Promise<OrderViewDTO[]> {
    const orders = await this.orderRepository.getAll();
    return orders.map((i) => i.toView());
  }

  async getByClient(clientId: number): Promise<OrderViewDTO[]> {
    const orders = await this.orderRepository.getByClient(clientId);

    return orders.map((i) => i.toView());
  }
}
