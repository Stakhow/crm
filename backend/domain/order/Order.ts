import dayjs from "dayjs";
import type { ClientViewDTO } from "../../../dto/ClientViewDTO";
import type { OrderViewDTO } from "../../../dto/OrderViewDTO";
import { AppError } from "../../../utils/error";

export type OrderStatus = "InProgress" | "Done" | "Cancelled";

export type OrderItem = {
  id: number;
  name: string;
  category: string;
  quantity: number;
  modifiers: { title: string; value: string | number; price: number }[];
  price: number;
  totalAmount: number;
  params: { title: string; value: number | string }[];
};

export class Order {
  public id: number;
  public client: ClientViewDTO;
  public items: OrderItem[];
  public itemsMap: Map<number, OrderItem>;
  public totalAmount: number;
  public quantity: number;
  public status: OrderStatus;
  public deadline: number;
  public createdAt: number;

  private localedStatuses: Map<OrderStatus, string>;

  constructor(
    id: number,
    client: ClientViewDTO,
    items: OrderItem[],
    totalAmount: number,
    quantity: number,
    status: OrderStatus,
    deadline: number,
    createdAt: number,
  ) {
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

    this.localedStatuses = new Map();
    this.localedStatuses.set("InProgress", "В роботі");
    this.localedStatuses.set("Done", "Виконано");
    this.localedStatuses.set("Cancelled", "Відмінений");
  

    this.itemsMap = new Map(items.map(i => [i.id, i]));
  }

  getOrderItem(id: number) {
    return this.itemsMap.get(id);
  }
 
  updateStatus(status: OrderStatus) {
    this.status = status;
  }

  toView(): OrderViewDTO {
    return {
      id: this.id,
      client: {
        id: this.client.id,
        name: this.client.name,
        phone: this.client.phone,
        createdAt: this.client.createdAt,
        updatedAt: this.client.updatedAt,
      },
      items: this.items,
      totalAmount: this.totalAmount,
      quantity: this.quantity,
      status: this.status,
      statusTitle: this.localedStatuses.get(this.status) ?? "",
      statuses: Array.from(this.localedStatuses, ([key, value]) => ({
        value: key,
        title: value,
      })),
      deadline: this.deadline,
      createdAt: this.createdAt,
    };
  }
}
