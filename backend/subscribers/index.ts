import { globalEventBus } from "../shared/EventBus";

export class Subscriber {
  init() {
    globalEventBus.subscribe("PRODUCT_PRICE_CHANGED", (data) => {});
  }
}
