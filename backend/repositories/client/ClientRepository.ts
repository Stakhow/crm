import { db } from "./../../../config/db";
import { AppError } from "./../../../utils/error";
import { Client, type ClientProps } from "./../../domain/client/Client";
import type { IClientRepository } from "./IClientRepository";

export class ClientRepository implements IClientRepository {
  private _create(clientDTO: ClientProps) {
    return new Client(clientDTO);
  }

  private _formatPhoneNumber(phone: string) {
    // 1. Remove all non-numeric characters
    let cleaned = ("" + phone).replace(/\D/g, "");

    // 2. Normalize: Remove leading '38' if it exists to normalize (0xx)xxx-xx-xx
    if (cleaned.startsWith("38")) {
      cleaned = cleaned.substring(2);
    }

    // 3. Ensure it starts with '0' and has 10 digits
    const match = cleaned.match(/^0\d{9}$/);

    if (match) {
      // 4. Apply format: +38 (0xx) xxx-xx-xx
      return `+380${cleaned.substring(1, 3)}${cleaned.substring(3, 6)}${cleaned.substring(6, 8)}${cleaned.substring(8, 10)}`;
    } else throw new AppError("DOMAIN", "Помилка формату номера телефону");

    // return phone; // Return original or handle error if invalid
  }

  private async _createClientById(id: number) {
    const clientDTO = await db.clients.get(id);

    if (!clientDTO)
      throw new AppError("DATABASE", `Немає такого клієнта з ID: ${id}`);

    return this._create(clientDTO);
  }

  async createClient(data: { name: string; phone: string }) {
    const clientDTO = {
      id: 0,
      name: "",
      phone: "",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    return this._create({ ...clientDTO, name: data.name, phone: data.phone });
  }

  async getById(id: number): Promise<Client> {
    return !!id
      ? await this._createClientById(id)
      : this._create({
          id: 0,
          name: "",
          phone: "",
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
  }

  async getByIds(ids: number[]): Promise<Client[]> {
    const clientsDTO = await db.clients.bulkGet(ids);

    const clients = await Promise.all(
      clientsDTO.map((dto) => this._create(dto)),
    );

    return clients;
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

    await db.clients.toCollection().modify((client) => {
      client.phone = this._formatPhoneNumber(client.phone);
    });

    return clientsDTO.map((i) => this._create(i));
  }

  async save(client: Client): Promise<number> {
    const existingClient = await this.getByPhone(client.phone);

    if (!!existingClient && existingClient.id !== client.id) {
      throw new AppError(
        "DATABASE",
        `Клієнт з таким номером вже існує: ${client.phone}`,
      );
    }

    const clientDTO = client.toSaveDB();

    clientDTO.phone = this._formatPhoneNumber(clientDTO.phone);

    const savedClientId = existingClient
      ? await db.clients.update(client.id, {
          ...clientDTO,
          updatedAt: Date.now(),
        })
      : await db.clients.put(clientDTO);

    return savedClientId;
  }

  async saveBulk(clients: Client[]) {
    const clientsDTO = clients.map((i) => i.toSaveDB());
    const phones = clientsDTO.map((i) => i.phone);

    const existingClients = await db.clients
      .where("phone")
      .anyOf(phones)
      .toArray();


    if (!!existingClients.length) {
      const existingPhones = existingClients.map((i) => i.phone);

      throw new AppError("DATABASE", `Клієнти з такими номерами вже існують`, {
        data: existingPhones,
      });
    }

    return await db.clients.bulkAdd(clientsDTO, { allKeys: true });
  }
}
