import type { Production } from "../production/Production";

export interface IProductionRepository {
  add(products: Production[]): Promise<string[]>;
  delete(id: string | string[]): Promise<string | string[]>;
  getAll(): Promise<Production[]>;
  getByOrder(orderId: string): Promise<Production[]>;
  get(id: string): Promise<Production>;
  update(data: Production): Promise<string>;
}
