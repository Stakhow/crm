export interface ClientViewDTO {
  id: string;
  name: string;
  phone: string;
  createdAt: number;
  updatedAt: number;
}

export interface ClientCreateDTO {
  name: string;
  phone: string;
}
