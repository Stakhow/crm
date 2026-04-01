import { type IClientRepository } from "../repositories/client/IClientRepository";
import { Client } from "../domain/client/Client";
import type { ClientDTO } from "../../dto/ClientDTO";
import type { ClientViewDTO } from "../../dto/ClientViewDTO";

export class ClientService {
  constructor(private clientRepository: IClientRepository) {
    this.clientRepository = clientRepository;
  }

  async save(data: ClientDTO): Promise<number> {
    const client = new Client(data);

    return new Promise((resove, reject) => {
      if (client.isValid()) resove(this.clientRepository.save(client));
      else reject("Помилка збереження клієнта");
    });
  }

  async getById(id: number): Promise<ClientViewDTO> {
    return this.clientRepository.getById(id);
  }

  async getAll(): Promise<ClientViewDTO[]> {
    return await this.clientRepository.getAll();
  }

  async delete(id: number): Promise<void> {
    return await this.clientRepository.delete(id);
  }

}
