import type { ProductCategory } from "../backend/domain/product/ProductCategory";

export type ProductDataDTO = {
  id: number;
  name: string;
  createdAt: number;
  category: {
    id: number;
    name: ProductCategory;
    title: string;
  };
  categoryName: ProductCategory;
  price: number;
  totalAmount: number;
  weight: number;
  width?: number;
  thickness?: number;
  length?: number;
  quantity?: number;
};
