import { Client } from "../domain/client/Client";
import type { ClientViewDTO } from "../../dto/ClientViewDTO";
import type { ClientRepository } from "../repositories/client/ClientRepository";

export class ClientService {
  constructor(private clientRepository: ClientRepository) {
    this.clientRepository = clientRepository;
  }

  async saveBulk(clientsDTO: { name: string; phone: string }[]) {
    const clientsRaw = await Promise.all(
      clientsDTO.map((i) => this.clientRepository.createClient(i)),
    );

    const savedClientsIds = await this.clientRepository.saveBulk(clientsRaw);

    const clients = await this.clientRepository.getByIds(savedClientsIds);

    return clients.map((i) => i.toView());
  }

  async save(clientDTO: ClientViewDTO): Promise<ClientViewDTO> {
    const client = await this.clientRepository.createClient(clientDTO);

    const id = await this.clientRepository.save(client);

    const savedClient = await this.getById(id);

    return savedClient.toView();
  }

  async getById(id: number): Promise<Client> {
    return this.clientRepository.getById(id);
  }
  async getByIdToView(id: number): Promise<ClientViewDTO> {
    const client = await this.getById(id);

    return client.toView();
  }

  async getAll(): Promise<ClientViewDTO[]> {
    const clients = await this.clientRepository.getAll();

    return clients.map((i) => i.toView());
  }

  async delete(id: number): Promise<void> {
    return this.clientRepository.delete(id);
  }
}
