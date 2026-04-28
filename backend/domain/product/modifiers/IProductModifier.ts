import type { ProductModifierDTO } from "../../../../dto/ProductModifierDTO";
import type { ProductCategory } from "../ProductCategory";
import { type ProductModifierItemDTO } from "./../../../../dto/ProductModifierItemDTO";

export interface IProductModifier {
  apply(price: number): number;
  select(value: string | number): void;
  toDTO(): { id: number; itemId: number };
  toView(): { title: string; value: string | number; price: number };
  showFullData(): ProductModifierDTO;
  updateName(name: string): void;
  updateList: (list: ProductModifierItemDTO[]) => void;
  updateCatergories: (categoryNames: ProductCategory[]) => void;
}
