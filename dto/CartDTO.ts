export interface CartItemDTO {
  productId: string;
  price: number;
  quantity: number;
  name: string;
  total: number;
}

export interface CartDTO {
  id: string;
  items: CartItemDTO[];
  quantity: number;
  totalAmount: number;
  createdAt: number;
  productsIds: string[];
}
