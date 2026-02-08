import { Client } from './../../domain/client/Client';

export interface IClientRepository {
  save(client: Client): Promise<number>;
  getById(id: number): Promise<Client>;
  getAll(): Promise<Client[]>;
  delete(id: number): Promise<void>;
}
