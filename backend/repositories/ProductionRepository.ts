import { db } from "../../config/db";
import { AppError } from "../../utils/error";
import { type IProductionRepository } from "../domain/production/IProductionRepository";
import { Production } from "../domain/production/Production";

import { globalEventBus } from "../shared/EventBus";

export class ProductionRepository implements IProductionRepository {
  async add(productsToProduce: Production[]): Promise<string[]> {
    const productEntities = productsToProduce.map((i) => i.toDB());
    return await db.products_to_produce.bulkPut(productEntities, {
      allKeys: true,
    });
  }
  async delete(
    productToProductId: string | string[],
  ): Promise<string | string[]> {
    const ids = Array.isArray(productToProductId)
      ? productToProductId
      : [productToProductId];

    await db.products_to_produce.where("id").anyOf(ids).delete();

    return productToProductId;
  }
  async getAll(): Promise<Production[]> {
    const productEntities = await db.products_to_produce.toArray();

    return productEntities.map(
      (i) => new Production(i.id, i.productId, i.quantity, i.orderId, i.status),
    );
  }

  async getByOrder(orderId: string): Promise<Production[]> {
    const productEntities = await db.products_to_produce
      .where({ orderId })
      .toArray();

    return productEntities.map(
      (i) => new Production(i.id, i.productId, i.quantity, i.orderId, i.status),
    );
  }

  async get(produceProductId: string): Promise<Production> {
    const productEntity = await db.products_to_produce.get(produceProductId);
    if (!productEntity)
      throw new AppError("DOMAIN", "Не знайдено продукт для виготовлення");

    return new Production(
      productEntity.id,
      productEntity.productId,
      productEntity.quantity,
      productEntity.orderId,
      productEntity.status,
    );
  }

  async update(Production: Production): Promise<string> {
    await db.products_to_produce.update(Production.id, Production);
    globalEventBus.publishFromAggregate(Production);

    return Production.id;
  }
}
