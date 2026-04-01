import type { ProductModifierDTO } from "../../../../dto/ProductModifierDTO";
import type { ProductCategory } from "../ProductCategory";
import { type ProductModifierItemDTO } from "./../../../../dto/ProductModifierItemDTO";

export interface ProductModifierProps {
  readonly id: number;
  readonly name: string;
  readonly category: ProductCategory[];
  list: ProductModifierItemDTO[];
}

export interface IProductModifier extends ProductModifierProps {
  apply(price: number): number;
  select(value: string | number): void;
  toDTO(): { id: number; itemId: number };
  toView(): { title: string; value: string | number; price: number };
  showFullData(): ProductModifierDTO;
}
