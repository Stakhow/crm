export interface CartDTO {
  id: number;
  items: {
    productId: number;
    name: string;
    price: number;
    quantity: number;
  }[];
  quantity: number;
  totalAmount: number;
  createdAt: number;
  clientId: number;
}
