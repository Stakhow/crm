import { BaseProduct, type BaseProductProps } from "../../domain/product/BaseProduct";

export interface IProductRepository {
  save(product: BaseProductProps): Promise<number>;
  getById(id: number): Promise<BaseProduct>;
  getAll(): Promise<BaseProduct[]>;
  delete(id: number): Promise<void>;
  getByCategory(category: string): Promise<BaseProduct[] | null>;
}
