import { BaseProduct } from "../../domain/product/BaseProduct";
import type { ProductCategory } from "../../domain/product/ProductCategory";

export interface IProductRepository {
  save(product: BaseProduct<ProductCategory>): Promise<string>;
  update(product: BaseProduct<ProductCategory>): Promise<string>;
  getById(id: string): Promise<BaseProduct<ProductCategory>>;
  getByIds(id: string[]): Promise<BaseProduct<ProductCategory>[]>;
  getAll(): Promise<BaseProduct<ProductCategory>[]>;
  delete(id: string): Promise<string>;
  getProductsByCategory(
    category: ProductCategory,
  ): Promise<BaseProduct<ProductCategory>[]>;
}
