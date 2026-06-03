import { globalEventBus } from "../shared/EventBus";
// import { ProductService } from "../services/ProductService";
import { Order } from "../domain/order/Order";

export class OrderSubscriber {
  constructor(
    // private productService: ProductService
  ) {}

  init() {
    globalEventBus.subscribe("ORDER_IS_CREATED", async (order: Order) => {
      console.log("ORDER_IS_CREATED", order);

      // await this.productService.addToReserve(products);
      // await this.productService.createRequestToProduce(products);
    });

    globalEventBus.subscribe("ORDER_IS_DONE", async (order: Order) => {
      console.log("ORDER_IS_DONE", order);
      // const products = order.getWithdrawProducts();

      // await this.productService.withdrawProducts(products);
    });

    globalEventBus.subscribe("ORDER_IS_CANCELLED", async (order: Order) => {
      // const products = order.getProductsToWrightOff();

      console.log("ORDER_IS_CANCELLED", order);
    });
  }
}
