import type { ProductCategory } from "../backend/domain/product/ProductCategory";
import type { ProductModifierDTO } from "./ProductModifierDTO";

export type ProductToCreateFieldDTO = {
  name: string;
  title: string;
  fieldType: string;
  value: string | number;
  placeholder?: string;
  disabled?: boolean;
};

type ModifierValue = ProductModifierDTO & {
  value: number;
};

export type ProductToCreateDTO = {
  price: number;
  totalAmount: number;
  categoryName: ProductCategory;
  fields: ProductToCreateFieldDTO[];
  modifiers: ModifierValue[];
  weight: number;
  pricePerItem: number;
};
