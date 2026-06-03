import { Client } from "../domain/client/Client";
import type { ClientCreateDTO, ClientViewDTO } from "../../dto/ClientViewDTO";
import type { ClientRepository } from "../repositories/ClientRepository";

export class ClientService {
  constructor(private clientRepository: ClientRepository) {
    this.clientRepository = clientRepository;
  }

  async saveBulk(clientsDTO: { name: string; phone: string }[]) {
    const clientsRaw = await Promise.all(
      clientsDTO.map((i) => this.clientRepository.createDomain(i)),
    );

    const savedClientsIds = await this.clientRepository.saveBulk(clientsRaw);

    const clients = await this.clientRepository.getByIds(savedClientsIds);

    return clients.map((i) => i.toView());
  }

  async create(data: ClientCreateDTO): Promise<ClientViewDTO> {
    const client = await this.clientRepository.createDomain(data);

    const clientId = await this.clientRepository.create(client);

    const newClient = await this.getById(clientId);

    return newClient.toView();
  }
  async update(id: string, data: ClientCreateDTO): Promise<ClientViewDTO> {
    const client = await this.getById(id);

    client.name = data.name;
    client.phone = data.phone;

    const clientId = await this.clientRepository.update(client);

    const updatedClient = await this.getById(clientId);

    return updatedClient.toView();
  }

  async getById(id: string): Promise<Client> {
    return this.clientRepository.getById(id);
  }
  async getByIdToView(id: string): Promise<ClientViewDTO> {
    const client = await this.getById(id);

    return client.toView();
  }

  async getAll(): Promise<ClientViewDTO[]> {
    const clients = await this.clientRepository.getAll();

    return clients.map((i) => i.toView());
  }

  async delete(id: string): Promise<void> {
    return this.clientRepository.delete(id);
  }
}
