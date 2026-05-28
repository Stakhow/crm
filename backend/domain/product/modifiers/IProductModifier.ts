import type { ProductModifierDTO } from "../../../../dto/ProductModifierDTO";
import type { ProductCategory } from "../ProductCategory";
import { type ProductModifierItemDTO } from "./../../../../dto/ProductModifierItemDTO";

export interface IProductModifier {
  apply(price: number): number;
  select(valueId: string): void;
  toDTO(): { id: string; itemId: string };
  toView(): { title: string; valueId: string; price: number };
  showFullData(): ProductModifierDTO;
  updateName(name: string): void;
  updateList: (list: ProductModifierItemDTO[]) => void;
  updateCatergories: (categoryNames: ProductCategory[]) => void;
}
