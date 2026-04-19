export interface ClientProps {
  id: number;
  name: string;
  phone: string;
  createdAt: number;
  updatedAt: number;
}

export class Client {
  id: number;
  protected name: string;
  protected phone: string;
  protected createdAt: number;
  protected updatedAt: number;

  constructor(props: ClientProps) {
    this.id = props.id;
    this.name = props.name;
    this.phone = props.phone;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  toView() {
    return {
      id: this.id,
      name: this.name,
      phone: this.phone,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
