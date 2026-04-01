import type { ProductCategory } from "..//backend/domain/product/ProductCategory";
import type { ProductModifierDTO } from "./ProductModifierDTO";

export type ProductToCreateFieldDTO = {
  name: string;
  title: string;
  fieldType: string;
  value: string | number;
  placeholder?: string;
};

export type ProductToCreateDTO = {
  category: {
    id: number;
    name: ProductCategory;
    title: string;
  };
  modifiers: ProductModifierDTO[];
  extendedFields: ProductToCreateFieldDTO[];
  initialValues: {
    modifiers: { id: number; itemId: number }[];
    fields: {
      name: string;
      value: number | string;
    }[];
  };
  price: number;
};
