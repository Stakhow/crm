import { AppError } from "../../utils/error";
import type { OrderRepository } from "../repositories/order/OrderRepository";
import type { CartService } from "./CartService";
import { Order, type OrderStatus } from "../domain/order/Order";
import type { OrderViewDTO } from "../../dto/OrderViewDTO";
import type { ProductService } from "./ProductService";
import dayjs from "dayjs";
import type { ClientService } from "./ClientService";

export class OrderService {
  private status: "InProgress" | "Done" | "Cancelled" = "InProgress";

  constructor(
    private orderRepository: OrderRepository,
    private cartService: CartService,
    private productService: ProductService,
    private clientService: ClientService,
  ) {}

  async createOrder(date: number) {
    const cart = await this.cartService.getCart();

    if (!dayjs.unix(date).isValid()) {
      throw new AppError("SERVICE", "Кінце дата замовлення не вказана");
    }

    if (!cart || !cart.isValid())
      throw new AppError("SERVICE", "Помилка корзини");

    const cartToView = await this.cartService.getCartToView();
    const clientId = cartToView.clientId;

    if (!clientId) throw new AppError("SERVICE", "В корзині відсутній клієнт");

    const _client = await this.clientService.getById(clientId);
    const client = _client.toView();

    const productsId = cart.getProductsId();
    const stockProducts = await this.productService.getProductByIds(productsId);
    stockProducts.map((product) => {
      const cartItem = cart.getItem(product.id);

      if (!cartItem) throw new AppError("SERVICE", "Позиція відсутня!");

      try {
        product.updateQuantity(cartItem.quantity, "subtract");
      } catch (error) {
        throw new AppError("DOMAIN", "Товару не вистачає");
      }

      return product;
    });

    const orderId = await this.orderRepository.save(
      new Order(
        0,
        {
          id: client.id,
          name: client.name,
          phone: client.phone,
          createdAt: client.createdAt,
          updatedAt: client.updatedAt,
        },
        [],
        cartToView.totalAmount,
        cartToView.quantity,
        this.status,
        date,
        Date.now(),
      ),
      stockProducts,
    );

    try {
      await this.cartService.resetCart();
    } catch (error) {
      throw new AppError(
        "SERVICE",
        `Помилка при видаленні корзини ${error instanceof AppError && error.message}`,
      );
    }

    return await this.getById(orderId);
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
        quantity: i.quantity,
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
