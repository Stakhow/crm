import { OrderItem } from './OrderItem';

export class Order {
  constructor(
    public id: string,
    public readonly clientId: string,
    public readonly items: OrderItem[],
    public readonly totalPrice: number,
    public readonly createdAt: Date = new Date()
  ) {}
}
