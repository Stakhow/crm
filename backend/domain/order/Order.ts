import type { OrderViewDTO } from "../../../dto/OrderViewDTO";
import type { ProductViewDTO } from "../../../dto/ProductViewDTO";

export type Status = "InProgress" | "Done" | "Cancelled";

export class Order {
  public id: number | null;
  public client: { id: number; name: string; phone: string };
  public items: ProductViewDTO[];
  public totalAmount: number;
  public quantity: number;
  public status: Status;
  public createdAt: string;
  private localedStatuses: Map<Status, string>;

  constructor(
    id: number | null,
    client: { id: number; name: string; phone: string },
    items: ProductViewDTO[],
    totalAmount: number,
    quantity: number,
    status: "InProgress" | "Done" | "Cancelled",
    createdAt: string,
  ) {
    this.id = id;
    this.client = client;
    this.items = items;
    this.totalAmount = totalAmount;
    this.quantity = quantity;
    this.status = status;
    this.createdAt = createdAt;

    this.localedStatuses = new Map();
    this.localedStatuses.set("InProgress", "В роботі");
    this.localedStatuses.set("Done", "Виконано");
    this.localedStatuses.set("Cancelled", "Відмінений");
  }

  // localeStatus(): string {
  //   const status = this.localedStatuses.get(this.status);
  //   return status ?? "В роботі";
  // }

  // getStatuses() {
  //   return Object.entries(this.localedStatuses);
  // }

  updateStatus(status: Status) {
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
      statuses: Array.from(this.localedStatuses, ([key, value]) => ({
        value: key,
        title: value,
      })),
      createdAt: this.createdAt,
    };
  }
}
