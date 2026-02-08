// import { IProductRepository } from "../../domain/product/IProductRepository";
// import { Product, OptionGroup } from "../../domain/product/Product.entity";
import { db } from "./../../../config/db";
import { AppError } from "../../utils/error";
import type { ClientDTO } from "../../../dto/ClientDTO";
import { Client } from "./../../domain/client/Client";
import type { IClientRepository } from "./IClientRepository";

export class ClientRepository implements IClientRepository {
  async getById(id: number): Promise<Client> {
    const client = await db.clients.get(id);

    if (!client) throw new AppError("DATABASE", "Немає такого клієнта");

    return client;
  }

  async delete(id: number): Promise<void> {
    return await db.clients.delete(id);
  }

  async getAll(): Promise<Client[]> {
    return await db.clients.toArray();
  }

  // async loadOptionGroups(productId: number): Promise<OptionGroup[]> {
  //   const rels = await db.product_option_relations
  //     .where("productId")
  //     .equals(productId)
  //     .toArray();
  //   const gIds = rels.map((r) => r.groupId);
  //   const groups = await db.option_groups.where("id").anyOf(gIds).toArray();
  //   for (const g of groups) {
  //     g.values = await db.option_values.where("groupId").equals(g.id).toArray();
  //   }
  //   return groups;
  // }

  async save(client: Client): Promise<number> {
    if(client.hasOwnProperty('id')) delete client.id;
    
    const clientId = await db.clients.put({
      name: client.name,
      phone: client.phone,
      createdAt: new Date().toISOString(),
    });

    if (!clientId)
      throw new AppError("DATABASE", "Помилка при створенні клієнта");

    return clientId;
  }
}

// import { IClientRepository } from './IClientRepository';
// import { Client } from './../../domain/client/Client';
// import { IndexedDB } from './../../../config/db';
// import type { ClientDTO } from '../../../dto/ClientDTO';

// const STORE = 'clients';

// export class ClientRepository implements IClientRepository {
//   constructor(private readonly db: IndexedDB) {}

//   save(client: ClientDTO): Promise<void> {
//     return this.db.transaction<void>(STORE, 'readwrite', store =>
//       store.put({...client, createdAt: new Date().toISOString()})
//     );
//   }

//   getById(id: number): Promise<Client | null> {
//     return this.db.transaction<Client | null>(STORE, 'readonly', store =>
//       store.get(id)
//     );
//   }

//   getAll(): Promise<Client[]> {
//     return this.db.transaction<Client[]>(STORE, 'readonly', store =>
//       store.getAll()
//     );
//   }

//   delete(id: number): Promise<void> {
//     return this.db.transaction<void>(STORE, 'readwrite', store =>
//       store.delete(id)
//     );
//   }
// }
