import type { CartItemProps } from "../backend/domain/cart/Cart";

export interface CartDTO {
  id: number;
  items: CartItemProps[];
  quantity: number;
  totalAmount: number;
  createdAt: number;
  clientId: number;
}
