import type { Client } from "../../domain/client/Client";

export interface IClientRepository {
  save(client: Client): Promise<number>;
  getById(id: number): Promise<Client>;
  getByIds(ids: number[]): Promise<Client[]>;
  getByPhone(phoneNumber: string): Promise<Client>;
  getAll(): Promise<Client[]>;
  delete(id: number): Promise<void>;
  saveBulk(clients: Client[]): Promise<number[]>;
}
