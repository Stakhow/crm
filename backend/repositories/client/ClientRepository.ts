// import { IProductRepository } from "../../domain/product/IProductRepository";
// import { Product, OptionGroup } from "../../domain/product/Product.entity";
import { db } from "./../../../config/db";
import { AppError } from "./../../../utils/error";
import type { ClientViewDTO } from "../../../dto/ClientViewDTO";
import { Client } from "./../../domain/client/Client";
import type { IClientRepository } from "./IClientRepository";

export class ClientRepository implements IClientRepository {
  async getById(id: number): Promise<ClientViewDTO> {
    const client = await db.clients.get(id);

    if (!client) throw new AppError("DATABASE", "Немає такого клієнта");

    return client;
  }

  async getByPhone(phone: string): Promise<ClientViewDTO | undefined> {
    const client = await db.clients.where({ phone }).first();

    return client;
  }

  async delete(id: number): Promise<void> {
    return await db.clients.delete(id);
  }

  async getAll(): Promise<ClientViewDTO[]> {
    return await db.clients.toArray();
  }

  async save(client: Client): Promise<number> {
    const { id, name, phone } = client.toPersistent();

    const isNewClient = !id || id == 0;

    const existingClient = await this.getByPhone(phone);

    if (!!existingClient && existingClient.id !== id) {
      throw new AppError("DATABASE", "Клієнт з таким номером вже існує");
    }

    if (isNewClient)
      return await db.clients.put({
        name,
        phone,
        createdAt: new Date().toISOString(),
      });
    else
      return await db.clients.update(id, {
        name,
        phone,
        updatedAt: new Date().toISOString(),
      });
  }
}
