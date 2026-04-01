import { type ProductModifierItemDTO } from "./ProductModifierItemDTO";

export interface ProductModifierDTO {
  id: number;
  name: string;
  category: string[];
  list: ProductModifierItemDTO[];
}
