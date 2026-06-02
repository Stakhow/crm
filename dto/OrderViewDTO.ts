import type { OrderStatus } from "../backend/domain/order/Order";
import type { OrderItemProp } from "../backend/domain/order/OrderItem";

export interface OrderViewDTO {
  id: string;
  client: { id: string; name: string; phone: string };
  items: OrderItemProp[];
  totalAmount: number;
  quantity: number;
  status: OrderStatus;
  // statusTitle: string;
  // statuses: { title: string; value: OrderStatus }[];
  statuses: OrderStatus[];
  deadline: number;
  createdAt: number;
  amountPaid: number;
  isPaid: boolean;
}
