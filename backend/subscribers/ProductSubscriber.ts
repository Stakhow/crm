// import type { ProductService } from "../services/ProductService";
import { globalEventBus } from "../shared/EventBus";

export class ProductSubscriber {
  constructor(
    // private productService: ProductService
  ) {}
  init() {
    globalEventBus.subscribe("PRODUCT_PRICE_CHANGED", (data) => {
      console.log("PRODUCT_PRICE_CHANGED", data);
    });

    globalEventBus.subscribe("PRODUCT_IS_DONE", async (product) => {
      console.log("PRODUCT_IS_DONE", product);
    });
  }
}
