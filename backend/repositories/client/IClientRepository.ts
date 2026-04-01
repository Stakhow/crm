import type { ClientViewDTO } from "../../../dto/ClientViewDTO";
import type { Client } from "../../domain/client/Client";

export interface IClientRepository {
  save(client: Client): Promise<number>;
  getById(id: number): Promise<ClientViewDTO>;
  getByPhone(phoneNumber: string): Promise<ClientViewDTO | undefined>;
  getAll(): Promise<ClientViewDTO[]>;
  delete(id: number): Promise<void>;
}
