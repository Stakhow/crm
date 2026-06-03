import { type ProductReserve } from "../../../dto/ProductReserve";
import { BaseProduct } from "../../domain/product/BaseProduct";
import type { ProductCategory } from "../../domain/product/ProductCategory";
import type { ProductToProduce } from "../../domain/productToProduce/ProductToProduce";

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

  addToProduce(products: ProductToProduce[]): Promise<string[]>;
  deleteFromProduce(id: string | string[]): Promise<string | string[]>;
  getAllToProduce(): Promise<ProductToProduce[]>;
  getToProduceByOrder(orderId: string): Promise<ProductToProduce[]>;
  getProductToProduce(id: string): Promise<ProductToProduce>;
  setProductAsProduced(data: ProductToProduce): Promise<string>;
}
