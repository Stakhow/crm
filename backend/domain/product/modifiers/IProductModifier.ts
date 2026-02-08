import { type ProductModifierItemDTO } from "./../../../../dto/ProductModifierItemDTO";


export interface ProductModifierProps {
  readonly id: string;
  readonly name: string;
  readonly title: string;
  readonly category: string[];
  list: ProductModifierItemDTO[];
}


export interface IProductModifier extends ProductModifierProps {
  apply(price: number): number;
}


