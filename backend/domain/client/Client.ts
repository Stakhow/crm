import type { ClientDTO } from "../../../dto/ClientDTO";

interface IClient {
  id?: number;
  name: string;
  phone: string;
  createdAt?: string;
}

export class Client {
  id: number;
  protected name: string;
  protected phone: string;
  protected createdAt?: string;
  protected updatedAt?: string;

  constructor(props: IClient) {
    this.id = props.id ?? 0;
    this.name = props.name;
    this.phone = props.phone;
    this.createdAt = props.createdAt ?? ""; // 0 for new objects
  }

  isValid(): boolean {
    return !!this.name && !!this.phone;
  }

  toView() {
    return {
      id: this.id,
      name: this.name,
      phone: this.phone,
      createdAt: this.createdAt,
    };
  }
  toPersistent() {
    return {
      id: this.id,
      name: this.name,
      phone: this.phone,
    };
  }
  updateData(data: ClientDTO) {
    this.name = data.name ?? this.name;
    this.phone = data.phone ?? this.phone;
  }
}
