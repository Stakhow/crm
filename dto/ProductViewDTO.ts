import type { ProductCategory } from "./../backend/domain/product/ProductCategory";

export type ProductUnitType = "piece" | "kilogram";

type Base = {
  id: string;
  createdAt: number;
  updatedAt: number;
  name: string;
  categoryName: ProductCategory;
  quantity: number;
  weight: number;
  price: number;
  totalAmount: number;
  isAvailable: boolean;
  unit: ProductUnitType;
};

export type ProductViewDTO = Base & {
  fields: { [key: string]: string | number };
};

export type ProductViewUIDTO = Base & {
  fields: { title: string; value: number | string }[];
};
