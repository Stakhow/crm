import type { ProductViewDTO } from "./ProductViewDTO";

export type CartProductViewDTO = ProductViewDTO & {
  stock: number;
};

