import type { ClientCreateDTO } from "../../../dto/ClientViewDTO";
import { generateId } from "../../../utils/utils";
import { db } from "./../../../config/db";
import { AppError } from "./../../../utils/error";
import { Client, type ClientProps } from "./../../domain/client/Client";
import type { IClientRepository } from "../../domain/client/IClientRepository";

export class ClientRepository implements IClientRepository {
  private _create(clientDTO: ClientProps) {
    return new Client(clientDTO);
  }

  private _formatPhoneNumber(phone: string) {
    let cleaned = ("" + phone).replace(/\D/g, "");

    if (cleaned.startsWith("38")) {
      cleaned = cleaned.substring(2);
    }

    const match = cleaned.match(/^0\d{9}$/);

    if (match) {
      return `+380${cleaned.substring(1, 3)}${cleaned.substring(3, 6)}${cleaned.substring(6, 8)}${cleaned.substring(8, 10)}`;
    } else throw new AppError("DOMAIN", "Помилка формату номера телефону");
  }

  async createDomain(data: ClientCreateDTO) {
    return this._create({
      id: generateId(),
      name: data.name,
      phone: data.phone,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  }

  async getById(id: string): Promise<Client> {
    const clientDTO = await db.clients.get(id);

    if (!clientDTO)
      throw new AppError("DATABASE", `Немає такого клієнта з ID: ${id}`);

    return this._create(clientDTO);
  }

  async getByIds(ids: string[]): Promise<Client[]> {
    const clientsDTO = (await db.clients.bulkGet(ids)).filter((i) => !!i);

    const clients = clientsDTO.map((dto) => this._create(dto));

    return clients;
  }

  async getByPhone(phone: string) {
    const client = await db.clients.where({ phone }).first();
    if (!client)
      throw new AppError("DATABASE", `Немає клієнта з таким номером телефону`, {
        data: phone,
      });

    return this._create(client);
  }

  async delete(id: string): Promise<void> {
    return await db.clients.delete(id);
  }

  async getAll(): Promise<Client[]> {
    const clientsDTO = await db.clients.reverse().toArray();

    await db.clients.toCollection().modify((client) => {
      client.phone = this._formatPhoneNumber(client.phone);
    });

    return clientsDTO.map((i) => this._create(i));
  }

  async create(client: Client): Promise<string> {
    const existingClient = await this.getByPhone(client.phone);

    if (!!existingClient && existingClient.id !== client.id) {
      throw new AppError(
        "DATABASE",
        `Клієнт з таким номером вже існує: ${client.phone}`,
      );
    }

    const clientDTO = client.toSaveDB();

    clientDTO.phone = this._formatPhoneNumber(clientDTO.phone);

    await db.clients.put(clientDTO);

    return client.id;
  }
  async update(client: Client): Promise<string> {
    const existingClient = await this.getByPhone(client.phone);

    if (!!existingClient && existingClient.id !== client.id) {
      throw new AppError(
        "DATABASE",
        `Клієнт з таким номером вже існує: ${client.phone}`,
      );
    }

    const clientDTO = client.toSaveDB();

    clientDTO.phone = this._formatPhoneNumber(clientDTO.phone);

    await db.clients.update(client.id, clientDTO);

    return client.id;
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
