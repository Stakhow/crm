import type { OrderStatus } from "../backend/domain/order/Order";
import type { ProductViewDTO } from "./ProductViewDTO";

export interface OrderViewDTO {
  id: number | null;
  client: { id: number; name: string; phone: string };
  items: ProductViewDTO[];
  totalAmount: number;
  quantity: number;
  status: OrderStatus;
  statuses: { title: string; value: OrderStatus }[];
  deadline: string;
  createdAt: string;
}
