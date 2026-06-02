import { globalEventBus } from "../shared/EventBus";
import { ProductService } from "../services/ProductService";
import { Order } from "../domain/order/Order";

export class OrderSubscriber {
  constructor(private productService: ProductService) {}

  init() {
    globalEventBus.subscribe("ORDER_CREATED", async (order: Order) => {
      console.log("ORDER_CREATED", order);

      const products = order.getProductsToWrightOff();

      await this.productService.addToReserve(products);
      await this.productService.createRequestToProduce(products);
    });
  }
}
