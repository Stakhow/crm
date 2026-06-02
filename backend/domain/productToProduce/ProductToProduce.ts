import { type IProductProduce } from "../../../dto/ProductProduce";
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

export class ProductToProduce extends EventBusRoot implements IProductProduce {
  constructor(
    public readonly id: string,
    public readonly productId: string,
    public readonly quantity: number,
    private _status: Status = "InProgress",
  ) {
    super();
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
    };
  }
  toView() {
    return {
      id: this.id,
      productId: this.productId,
      quantity: this.quantity,
      status: this.status,
    };
  }
}
