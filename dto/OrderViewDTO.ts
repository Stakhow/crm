import type { OrderStatus } from "../backend/domain/order/Order";
import type { ClientViewDTO } from "./ClientViewDTO";
import type { ProductViewDTO } from "./ProductViewDTO";

export interface OrderViewDTO {
  id: number;
  client: ClientViewDTO;
  items: ProductViewDTO[];
  totalAmount: number;
  quantity: number;
  status: OrderStatus;
  statusTitle: string;
  statuses: { title: string; value: OrderStatus }[];
  deadline: number;
  createdAt: number;
}
