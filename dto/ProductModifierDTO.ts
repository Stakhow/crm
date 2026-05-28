import type { ProductCategory } from "../backend/domain/product/ProductCategory";
import { type ProductModifierItemDTO } from "./ProductModifierItemDTO";

export interface ProductModifierDTO {
  id: string;
  name: string;
  categories: ProductCategory[];
  list: ProductModifierItemDTO[];
}
