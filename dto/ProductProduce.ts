export interface IProductProduce {
  id: string;
  productId: string;
  quantity: number;
  status: "InProgress" | "Done";
}
