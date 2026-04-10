import { AppError } from "../../utils/error";

import type { OrderRepository } from "../repositories/order/OrderRepository";
import type { CartService } from "./CartService";
import { Order, type OrderStatus } from "../domain/order/Order";
import type { OrderViewDTO } from "../../dto/OrderViewDTO";
import type { ProductService } from "./ProductService";

export class OrderService {
  private status: "InProgress" | "Done" | "Cancelled" = "InProgress";

  constructor(
    private orderRepository: OrderRepository,
    private cartService: CartService,
    private productService: ProductService,
  ) {}

  async createOrder(deadline: number) {
    const cart = await this.cartService.getCart();

    if (!cart || !cart.isValid())
      throw new AppError("SERVICE", "Помилка корзини");

    const cartToView = await this.cartService.getCartToView();
    const client = cartToView.client;

    if (!client) throw new AppError("SERVICE", "В корзині відсутній клієнт");

    const productsId = cart.getProductsId();
    const stockProducts = await this.productService.getProductByIds(productsId);
    stockProducts.map((product) => {
      const cartItem = cart.getItem(product.id);

      if (!cartItem) throw new AppError("SERVICE", "Позиція відсутня!");

      product.updateMainParam(cartItem.quantity, "subtract");

      return product;
    });

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
        deadline,
        Date.now(),
      ),
      stockProducts,
    );

    await this.cartService.resetCart();

    return orderId;
  }

  async updateStatus(id: number, status: OrderStatus): Promise<number> {
    const order = await this.orderRepository.getById(id);

    if (status) order.updateStatus(status);

    return await this.orderRepository.update(order);
  }

  async repeatOrder(id: number) {
    const order = await this.orderRepository.getById(id);

    return this.cartService.createFromOrder(
      order.items.map((i) => ({
        productId: i.id,
        quantity: i.weight, // TODO!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
        clientId: order.client.id,
      })),
    );
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

  async getAllByTargetDate(deadline: number): Promise<OrderViewDTO[]> {
    if (!deadline) throw new AppError("SERVICE", "Дата не вказана");

    const orders = await this.orderRepository.getAllByTargetDate(deadline);
    return orders.map((i) => i.toView());
  }
}
