import { AppError } from "../../utils/error";
import type { OrderRepository } from "../repositories/order/OrderRepository";
import type { CartService } from "./CartService";
import { Order, type OrderStatus } from "../domain/order/Order";
import { OrderItem } from "../domain/order/OrderItem";
import type { OrderViewDTO } from "../../dto/OrderViewDTO";
import type { ProductService } from "./ProductService";
import type { ClientService } from "./ClientService";
import { generateId } from "../../utils/utils";
import { CheckoutService } from "./CheckoutService";

export class OrderService {
  private status: "InProgress" | "Done" | "Cancelled" = "InProgress";

  constructor(
    private orderRepository: OrderRepository,
    private cartService: CartService,
    private productService: ProductService,
    private clientService: ClientService,
    private checkoutService: CheckoutService,
  ) {}

  async createOrder(
    cartId: string,
    dueDate: number,
    amountPaid: number,
    clientId: string,
  ) {
    const cart = await this.cartService.getCartToView(cartId);
    const client = await this.clientService.getById(clientId);

    const { totalAmount, quantity, productsIds } = cart;

    const stockProductsMap =
      await this.productService.getProductByIdsMap(productsIds);

    const orderItems = cart.items.map((i) => {
      const product = stockProductsMap.get(i.productId);
      if (!product)
        throw new AppError("DOMAIN", "Товар в корзині відсутній на складі");

      product.quantity = i.quantity;

      const item = new OrderItem({
        id: generateId(),
        productId: product.id,
        name: product.name,
        category: product.categoryName,
        quantity: product.quantity,
        price: product.price,
        totalAmount: product.totalAmount,
        unit: product.unit,
      });

      return item;
    });

    const order = new Order(
      generateId(),
      client.toView(),
      orderItems,
      totalAmount,
      quantity,
      this.status,
      dueDate,
      Date.now(),
      amountPaid,
    );

    const orderId = await this.checkoutService.commitOrder(order, cart.id);

    return await this.getById(orderId);
  }

  async updateStatus(id: string, status: OrderStatus): Promise<string> {
    const order = await this.orderRepository.getById(id);

    order.updateStatus(status);

    return await this.orderRepository.update(order);
  }

  async updateAmountPaid(id: string, amount: number): Promise<OrderViewDTO> {
    const order = await this.orderRepository.getById(id);

    order.updateAmount(amount);

    const orderId = await this.orderRepository.update(order);

    return this.getById(orderId);
  }

  async repeatOrder(id: string) {
    const order = await this.orderRepository.getById(id);

    return this.cartService.createFromOrder(
      order.items.map((i) => ({
        cartId: "",
        productId: i.productId,
        quantity: i.quantity,
      })),
    );
  }

  async getById(id: string): Promise<OrderViewDTO> {
    const order = await this.orderRepository.getById(id);

    return order.toView();
  }

  async getAll(): Promise<OrderViewDTO[]> {
    const orders = await this.orderRepository.getAll();
    return orders.map((i) => i.toView());
  }

  async getByClient(clientId: string): Promise<OrderViewDTO[]> {
    const orders = await this.orderRepository.getByClient(clientId);

    return orders.map((i) => i.toView());
  }

  async getAllByTargetDate(timestamp: number): Promise<OrderViewDTO[]> {
    if (!timestamp) throw new AppError("SERVICE", "Дата не вказана");

    const orders = await this.orderRepository.getAllByTargetDate(timestamp);
    return orders.map((i) => i.toView());
  }
  async getOrdersByMonth(
    timestamp: number,
  ): Promise<Map<number, OrderViewDTO[]>> {
    if (!timestamp) throw new AppError("SERVICE", "Дата не вказана");

    const orders = await this.orderRepository.getAllByMonth(timestamp);

    const ordersMap = new Map<number, OrderViewDTO[]>();

    orders.map((o) => {
      const date = new Date(o.deadline);
      const dayOfMonth = date.getDate();

      const orderDTO = o.toView();
      const row = ordersMap.get(dayOfMonth);

      if (!!row) row.push(orderDTO);
      else ordersMap.set(dayOfMonth, [orderDTO]);
    });

    return ordersMap;
  }
}
