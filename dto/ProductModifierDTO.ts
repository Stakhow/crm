import type { ProductCategory } from "../backend/domain/product/ProductCategory";
import { type ProductModifierItemDTO } from "./ProductModifierItemDTO";

export interface ProductModifierDTO {
  id: number;
  name: string;
  category: ProductCategory[];
  list: ProductModifierItemDTO[];
}
