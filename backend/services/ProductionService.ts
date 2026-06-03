import { generateId } from "../../utils/utils";
import { Production } from "../domain/production/Production";
import { ProductionRepository } from "../repositories/ProductionRepository";
import { ProductService } from "./ProductService";

export class ProductionService {
  constructor(
    private productService: ProductService,
    private repository: ProductionRepository,
  ) {}

  public async toProduce(
    data: { productId: string; quantity: number; orderId: string }[],
  ) {
    const products = await this.productService.getProductByIdsMap(
      data.map((i) => i.productId),
    );

    const production = data.reduce((acc, i) => {
      const product = products.get(i.productId);
      const diff = i.quantity - (product?.quantity ?? 0);

      if (product && diff > 0) {
        acc.push(new Production(generateId(), product.id, diff, i.orderId));
      }

      return acc;
    }, [] as Production[]);

    return this.repository.add(production);
  }

  public async delete(productToProductId: string | string[]) {
    return await this.repository.delete(productToProductId);
  }

  public async getAll() {
    const production = await this.repository.getAll();

    const productsToProduceMap = new Map(
      production.map((i) => [i.productId, i]),
    );

    const products = await this.productService.getProductByIds(
      production.map((i) => i.productId),
    );

    return products.map((p) => {
      const production = productsToProduceMap.get(p.id);

      if (production) {
        p.quantity = production.quantity;

        return { ...p.toView(), id: production.id };
      }

      return p.toView();
    });
  }

  public async setDone(productionId: string) {
    const production = await this.repository.get(productionId);

    production.setDone();

    await this.repository.update(production);

    await this.delete(productionId);

    await this.productService.updateProductQuantity(
      production.productId,
      "add",
      production.quantity,
    );

    return production;
  }

  public async getByOrder(orderId: string) {
    return await this.repository.getByOrder(orderId);
  }
}
