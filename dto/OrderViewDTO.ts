import type { OrderStatus } from "../backend/domain/order/Order";
import type { ProductViewDTO } from "./ProductViewDTO";

export interface OrderViewDTO {
  id: number | null;
  client: { id: number; name: string; phone: string };
  items: ProductViewDTO[];
  totalAmount: number;
  quantity: number;
  status: OrderStatus;
  statusTitle: string;
  statuses: { title: string; value: OrderStatus }[];
  deadline: number;
  createdAt: number;
}
