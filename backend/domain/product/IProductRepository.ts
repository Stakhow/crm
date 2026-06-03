import { type ProductReserve } from "../../../dto/ProductReserve";
import { BaseProduct } from "./BaseProduct";
import type { ProductCategory } from "./ProductCategory";

export interface IProductRepository {
  save(product: BaseProduct<ProductCategory>): Promise<string>;
  update(product: BaseProduct<ProductCategory>): Promise<string>;
  updateBulk(products: BaseProduct<ProductCategory>[]): Promise<string[]>;
  getById(id: string): Promise<BaseProduct<ProductCategory>>;
  getByIds(id: string[]): Promise<BaseProduct<ProductCategory>[]>;
  getAll(): Promise<BaseProduct<ProductCategory>[]>;
  delete(id: string): Promise<string>;
  getProductsByCategory(
    category: ProductCategory,
  ): Promise<BaseProduct<ProductCategory>[]>;

  addToReserve(products: ProductReserve[]): Promise<string[]>;
  deleteFromReserve(id: string): Promise<string>;
}
