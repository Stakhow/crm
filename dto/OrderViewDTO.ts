import type { Status } from "../backend/domain/order/Order";
import type { ProductViewDTO } from "./ProductViewDTO";

export interface OrderViewDTO {
  id: number | null;
  client: { id: number; name: string; phone: string };
  items: ProductViewDTO[];
  totalAmount: number;
  quantity: number;
  status: Status;
  statuses: { title: string; value: Status }[];
  createdAt: string;
}
