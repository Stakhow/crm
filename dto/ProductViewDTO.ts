import type { ProductCategory } from "./../backend/domain/product/ProductCategory";

export type ProductViewDTO = {
  id: number;
  createdAt: number;
  name: string;
  category: {
    id: number;
    name: ProductCategory;
    title: string;
  };
  categoryName: ProductCategory;
  weight: number;
  modifiers: { title: string; value: string | number; price: number }[];
  price: number;
  totalAmount: number;
  fields: { title: string; value: number | string; name: string }[];
};
