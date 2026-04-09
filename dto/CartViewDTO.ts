import type { CartDTO } from "./CartDTO";
import type { ClientDTO } from "./ClientDTO";
import type { ProductViewDTO } from "./ProductViewDTO";

export type CartProductViewDTO = ProductViewDTO & {
  stock: number;
};

export interface CartViewDTO extends CartDTO {
  client: ClientDTO | undefined;
  products: CartProductViewDTO[];
}
