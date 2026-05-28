import type { ProductCategory } from "../backend/domain/product/ProductCategory";
import type { BagTypes, FilmTypes } from "./ProductDataDTO";

type CreateBaseProductFieldsDTO = {
  name: string;
  price: number;
  quantity: number;
};

export type CreateFilmFieldsDTO = CreateBaseProductFieldsDTO & {
  width: number;
  thickness: number;
  filmTypes: FilmTypes[];
};

export type CreateBagFieldsDTO = CreateBaseProductFieldsDTO & {
  length: number;
  width: number;
  thickness: number;
  filmTypes: FilmTypes[];
  bagTypes: BagTypes[];
};

export type CreateProductFieldsDTO =
  | CreateBaseProductFieldsDTO
  | CreateFilmFieldsDTO
  | CreateBagFieldsDTO;

export type CreateProductDTO = {
  categoryName: ProductCategory;
  fields: any;
  // fields: CreateProductFieldsDTO;
};

type KeysOfUnion<T> = T extends any ? keyof T : never;

export type CreateProductValues = {
  categoryName: ProductCategory;
  fields: Partial<Record<KeysOfUnion<CreateProductFieldsDTO>, string>>;
};
