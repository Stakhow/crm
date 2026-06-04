import type { OrderStatus } from "../backend/domain/order/Order";

export interface OrderQuery {
  status?: OrderStatus | "all";
  paid?: "unpaid" | "paid" | "all";
}
