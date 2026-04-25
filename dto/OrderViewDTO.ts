import type { OrderItem, OrderStatus } from "../backend/domain/order/Order";
import type { ClientViewDTO } from "./ClientViewDTO";

export interface OrderViewDTO {
  id: number;
  client: ClientViewDTO;
  items: OrderItem[];
  totalAmount: number;
  quantity: number;
  status: OrderStatus;
  statusTitle: string;
  statuses: { title: string; value: OrderStatus }[];
  deadline: number;
  createdAt: number;
  amountPaid: number;
  isPaid: boolean;
}
