export interface ClientProps {
  id: number;
  name: string;
  phone: string;
  createdAt: number;
  updatedAt: number;
}

export class Client {
  public id: number;
  public name: string;
  public phone: string;
  public createdAt: number;
  public updatedAt: number;

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
  toSaveDB() {
    return {
      name: this.name,
      phone: this.phone,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
