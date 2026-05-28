import type { Client } from "../../domain/client/Client";

export interface IClientRepository {
  create(client: Client): Promise<string>;
  update(client: Client): Promise<string>;
  getById(id: string): Promise<Client>;
  getByIds(ids: string[]): Promise<Client[]>;
  getByPhone(phoneNumber: string): Promise<Client>;
  getAll(): Promise<Client[]>;
  delete(id: string): Promise<void>;
  saveBulk(clients: Client[]): Promise<string[]>;
}
