import { BaseProduct } from "../../domain/product/BaseProduct";
import type { ProductModifier } from "../../domain/product/modifiers/ProductModifier";

export interface IProductRepository {
  save(product: BaseProduct): Promise<number>;
  getById(id: number): Promise<BaseProduct>;
  getByIds(id: number[]): Promise<BaseProduct[]>;
  getAll(): Promise<BaseProduct[]>;
  delete(id: number): Promise<void>;
  getByCategory(category: string): Promise<BaseProduct[]>;
  getAllModifiers(): Promise<ProductModifier[]>;
}
