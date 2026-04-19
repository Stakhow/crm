import { db } from "./../../../config/db";
import { AppError } from "./../../../utils/error";
import { Client, type ClientProps } from "./../../domain/client/Client";
import type { IClientRepository } from "./IClientRepository";

export class ClientRepository implements IClientRepository {
  private _create(clientDTO: ClientProps) {
    return new Client(clientDTO);
  }

  private async _createClientById(id: number) {
    const clientDTO = await db.clients.get(id);

    if (!clientDTO)
      throw new AppError("DATABASE", `Немає такого клієнта з ID: ${id}`);

    return this._create(clientDTO);
  }

  private async _createClient() {
    return this._create({
      id: 0,
      name: "",
      phone: "",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  }

  async createClient(clientDTO: ClientProps) {
    return this._create(clientDTO);
  }

  async getById(id: number): Promise<Client> {
    return !!id ? await this._createClientById(id) : this._createClient();
  }

  async getByPhone(phone: string) {
    const client = await db.clients.where({ phone }).first();

    return client;
  }

  async delete(id: number): Promise<void> {
    return await db.clients.delete(id);
  }

  async getAll(): Promise<Client[]> {
    const clientsDTO = await db.clients.reverse().toArray();

    return clientsDTO.map((i) => this._create(i));
  }

  async save(client: Client): Promise<number> {
    const { id, name, phone } = client.toView();
    const existingClient = await this.getByPhone(phone);

    if (!!existingClient && existingClient.id !== id) {
      throw new AppError("DATABASE", "Клієнт з таким номером вже існує");
    }

    const data = {
      name,
      phone,
      updatedAt: Date.now(),
    };

    const savedClientId = existingClient ? await db.clients.update(id, data) : await db.clients.put({ ...data, createdAt: Date.now() })

    return savedClientId;
  }
}
