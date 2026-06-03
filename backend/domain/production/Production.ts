import { AppError } from "../../../utils/error";
import { EventBusRoot, type DomainEvent } from "../../shared/EventBus";

type Status = "InProgress" | "Done";

class ProductProducedEvent implements DomainEvent {
  eventName: string = "PRODUCT_IS_DONE";
  occurredOn: Date = new Date();

  constructor(
    public payload: { id: string; productId: string; quantity: number },
  ) {}
}

export class Production extends EventBusRoot {
  constructor(
    public readonly id: string,
    public readonly productId: string,
    public readonly quantity: number,
    public readonly orderId: string,
    private _status: Status = "InProgress",
  ) {
    super();

    if (!id) throw new AppError("DOMAIN", "ID не вказано");
    if (!productId) throw new AppError("DOMAIN", "ID продукту не вказано");
    if (!quantity) throw new AppError("DOMAIN", "Кількість не вказано");
    if (!orderId) throw new AppError("DOMAIN", "ID замовлення не вказано");
  }

  set status(status: Status) {
    if (status !== "InProgress" && status !== "Done") {
      throw new AppError("DOMAIN", "Невідомий статус задачі");
    }
    this._status = status;
  }

  get status(): Status {
    return this._status;
  }

  setDone() {
    this.status = "Done";
    this.addDomainEvent(
      new ProductProducedEvent({
        id: this.id,
        productId: this.productId,
        quantity: this.quantity,
      }),
    );
  }

  toDB() {
    return {
      id: this.id,
      productId: this.productId,
      quantity: this.quantity,
      status: this.status,
      orderId: this.orderId,
    };
  }
  toView() {
    return {
      id: this.id,
      productId: this.productId,
      quantity: this.quantity,
      status: this.status,
      orderId: this.orderId,
    };
  }
}
