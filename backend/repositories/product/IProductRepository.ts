import { BaseProduct } from "../../domain/product/BaseProduct";

export interface IProductRepository {
  save(order: BaseProduct): Promise<void>;
  // getById(id: string): Promise<Order | null>;
  findAll(): Promise<BaseProduct[]>;
}
