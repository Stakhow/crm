import { type IClientRepository } from "../repositories/client/IClientRepository";
import { Client } from "../domain/client/Client";
import { ClientDTO } from "../../dto/ClientDTO";    

export class ClientService {
    constructor(private clientRepository: IClientRepository) {
      this.clientRepository = clientRepository;
    }

    save(clientData: ClientDTO): Promise<void> {
        const client = {
            name: clientData.name,
            phone: clientData.phone,
        };
        return this.clientRepository.save(client);
    }

    getById(id: number): Promise<Client | null> {
        return this.clientRepository.getById(id);
    }

    getAll(): Promise<Client[]> {
        return this.clientRepository.getAll();
    }

    delete(id: number): Promise<void> {
        return this.clientRepository.delete(id);
    }

    // delete(id: string): Promise<void> {
    //     // Assuming the repository has a delete method
    //     return this.clientRepository.delete(id);
    // }   
}

