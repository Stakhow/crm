import { AppError } from "../../../utils/error";

export interface ClientProps {
  id: string;
  name: string;
  phone: string;
  createdAt: number;
  updatedAt: number;
}

export class Client {
  public id: string;
  private _name: string = "";
  private _phone: string = "";
  public createdAt: number;
  public updatedAt: number;

  constructor(props: ClientProps) {
    this.id = props.id;
    this.name = props.name;
    this.phone = props.phone;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  set name(name: string) {
    if (!name.trim()) {
      throw new AppError("DOMAIN", "Ім'я не вказано");
    }
    this._name = name.trim();
  }

  get name() {
    return this._name;
  }

  set phone(phone: string) {
    this._phone = this._formatPhoneNumber(phone);
  }

  get phone() {
    return this._phone;
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
      id: this.id,
      name: this.name,
      phone: this.phone,
      createdAt: this.createdAt,
      updatedAt: Date.now(),
    };
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
}
