import type { ProductCategory } from "../backend/domain/product/ProductCategory";
import type { ProductUnitType } from "./ProductViewDTO";

export type ProductDataBaseDTO = {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  categoryName: ProductCategory;
  price: number;
  totalAmount: number;
  quantity: number;
  unit: ProductUnitType;
};

export type ProductDataFilmDTO = ProductDataBaseDTO & {
  width: number;
  thickness: number;
};
export type ProductDataBagDTO = ProductDataFilmDTO & {
  length: number;
};

export type ProductDataDTO =
  | ProductDataBaseDTO
  | ProductDataFilmDTO
  | ProductDataBagDTO;

export type FilmTypes = "sleeve" | "half sleeve" | "fabric" | "pocket";
export type BagTypes = "bag" | "handle" | "t-shirt";
