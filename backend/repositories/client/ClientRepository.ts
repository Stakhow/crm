import { IClientRepository } from './IClientRepository';
import { Client } from './../../domain/client/Client';
import { IndexedDB } from './../../../config/db';
import type { ClientDTO } from '../../../dto/ClientDTO';

const STORE = 'clients';

export class ClientRepository implements IClientRepository {
  constructor(private readonly db: IndexedDB) {}

  save(client: ClientDTO): Promise<void> {
    return this.db.transaction<void>(STORE, 'readwrite', store =>
      store.put({...client, createdAt: new Date().toISOString()})
    );
  }

  getById(id: number): Promise<Client | null> {
    return this.db.transaction<Client | null>(STORE, 'readonly', store =>
      store.get(id)
    );
  }

  getAll(): Promise<Client[]> {
    return this.db.transaction<Client[]>(STORE, 'readonly', store =>
      store.getAll()
    );
  }

  delete(id: number): Promise<void> {
    return this.db.transaction<void>(STORE, 'readwrite', store =>
      store.delete(id)
    );
  }
}
