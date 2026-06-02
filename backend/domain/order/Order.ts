import { OrderItem } from "./OrderItem";
import dayjs from "dayjs";
import type { OrderViewDTO } from "../../../dto/OrderViewDTO";
import { AppError } from "../../../utils/error";
import type { OrderDB, OrderItemDB } from "../../../config/db.types";
import { type DomainEvent, EventBusRoot } from "../../shared/EventBus";

export type OrderStatus = "InProgress" | "Done" | "Cancelled";

export class OrderCreateEvent implements DomainEvent {
  occurredOn: Date = new Date();
  eventName: string = "ORDER_CREATED";
  constructor(public payload: Order) {}
}

export class Order extends EventBusRoot {
  public statuses: OrderStatus[] = ["InProgress", "Done", "Cancelled"];
  public itemsMap: Map<string, OrderItem>;

  // private localedStatuses: Map<OrderStatus, string>;

  constructor(
    public id: string,
    public client: { id: string; name: string; phone: string },
    public items: OrderItem[],
    public totalAmount: number,
    public quantity: number,
    public status: OrderStatus,
    public deadline: number,
    public createdAt: number,
    public amountPaid: number,
  ) {
    super();

    this.id = id;

    if (!client) throw new AppError("DOMAIN", "Клієнта не вказано");
    this.client = client;

    if (!items || !items.length)
      throw new AppError("DOMAIN", "Не додано жодного товару");
    this.items = items;

    if (!totalAmount || totalAmount === 0)
      throw new AppError("DOMAIN", "Не вказано ціну");
    this.totalAmount = totalAmount;

    if (!quantity || quantity === 0)
      throw new AppError("DOMAIN", "Кількість не вказана");
    this.quantity = quantity;

    this.status = status;

    if (!dayjs.unix(deadline).isValid())
      throw new AppError("DOMAIN", "Не вказана кінцева дата замовлення");
    this.deadline = deadline;

    if (!createdAt) throw new AppError("DOMAIN", "Дата замовлення не вказана");
    this.createdAt = createdAt;

    this.amountPaid = amountPaid ?? 0;

    this.itemsMap = new Map(items.map((i) => [i.id, i]));

    this.addDomainEvent(new OrderCreateEvent(this));
  }

  getOrderItem(id: string) {
    return this.itemsMap.get(id);
  }

  addOrderItem(item: OrderItem) {
    this.items.push(item);
  }

  updateStatus(status: OrderStatus) {
    if (!status)
      throw new AppError("DOMAIN", "Помилка встановлення статусу замовлення");

    this.status = status;
  }

  updateAmount(amount: number) {
    if (Number.isNaN(amount) && amount <= 0)
      throw new AppError("DOMAIN", "Помилка ставновлення оплати замовлення");
    this.amountPaid = amount;
  }

  toView(): OrderViewDTO {
    return {
      id: this.id,
      client: {
        id: this.client.id,
        name: this.client.name,
        phone: this.client.phone,
      },
      items: this.items.map((i) => i.toViewItem()),
      totalAmount: this.totalAmount,
      quantity: this.quantity,
      status: this.status,
      statuses: this.statuses,
      deadline: this.deadline,
      createdAt: this.createdAt,
      amountPaid: this.amountPaid,
      isPaid: this.totalAmount - this.amountPaid <= 0,
    };
  }
  toSaveDB(): OrderDB {
    return {
      id: this.id,
      clientId: this.client.id,
      clientName: this.client.name,
      clientPhone: this.client.phone,
      totalAmount: this.totalAmount,
      quantity: this.quantity,
      status: this.status,
      deadline: this.deadline,
      createdAt: this.createdAt,
      amountPaid: this.amountPaid,
    };
  }
  toSaveItemsDB(): OrderItemDB[] {
    return this.items.map((i) => ({
      id: i.id,
      orderId: this.id,
      productId: i.productId,
      data: i,
    }));
  }

  getProductsToWrightOff() {
    return this.items.map((i) => ({
      productId: i.productId,
      quantity: i.quantity,
    }));
  }
}
