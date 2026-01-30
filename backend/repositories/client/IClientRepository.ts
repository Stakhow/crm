import { Client } from './../../domain/client/Client';
import { type ClientDTO } from '../../../dto/ClientDTO';

export interface IClientRepository {
  save(client: ClientDTO): Promise<void>;
  getById(id: number): Promise<Client | null>;
  getAll(): Promise<Client[]>;
  delete(id: number): Promise<void>;
}
