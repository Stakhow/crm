import type { IProductRepository } from "./IProductRepository";
import { db } from "../../../config/db";
import {
  BaseProduct,
  type BaseProductProps,
} from "../../domain/product/BaseProduct";
import { AppError } from "../../utils/error";

export class ProductRepository implements IProductRepository {
  async save(product: BaseProductProps): Promise<number> {
    if (product.hasOwnProperty("id")) delete product.id;

    return await db.products.put({
      ...product,
      createdAt: new Date().toISOString(),
    });
  }

  async getById(id: number): Promise<BaseProduct> {
    return await db.products.get(id);
  }

  async getAll(): Promise<BaseProduct[]> {
    return await db.products.toArray();
  }

  async delete(id: number): Promise<void> {
    return await db.products.delete(id);
  }

  async getByCategory(category: string): Promise<BaseProduct[] | null> {
    return await db.products.get({ category });
  }
}