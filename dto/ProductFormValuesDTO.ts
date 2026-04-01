import type { ProductCategory } from "..//backend/domain/product/ProductCategory";

export type ProductFormValuesDTO = {
  totalAmount: number;
  categoryName: ProductCategory;
  fields: { [key: number | string]: number | string };
  modifiers: { [key: number]: number };
  price?: number;
};
