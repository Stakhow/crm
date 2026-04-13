import type { ClientDTO } from "../../../dto/ClientDTO";
import type { OrderViewDTO } from "../../../dto/OrderViewDTO";
import type { ProductViewDTO } from "../../../dto/ProductViewDTO";

export type OrderStatus = "InProgress" | "Done" | "Cancelled";

export class Order {
  public id: number;
  public client: { id: number; name: string; phone: string };
  public items: ProductViewDTO[];
  public totalAmount: number;
  public quantity: number;
  public status: OrderStatus;
  public deadline: number;
  public createdAt: number;

  private localedStatuses: Map<OrderStatus, string>;

  constructor(
    id: number,
    client: ClientDTO,
    items: ProductViewDTO[],
    totalAmount: number,
    quantity: number,
    status: OrderStatus,
    deadline: number,
    createdAt: number,
  ) {
    this.id = id ?? undefined;
    this.client = client;
    this.items = items;
    this.totalAmount = totalAmount;
    this.quantity = quantity;
    this.status = status;
    this.deadline = deadline;
    this.createdAt = createdAt;

    this.localedStatuses = new Map();
    this.localedStatuses.set("InProgress", "В роботі");
    this.localedStatuses.set("Done", "Виконано");
    this.localedStatuses.set("Cancelled", "Відмінений");
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
