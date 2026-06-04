import type {
  FilmTypes,
  ProductDataFilmDTO,
} from "../../../../dto/ProductDataDTO";
import type { CreateFilmFieldsDTO } from "../../../../dto/ProductToCreateDTO";
import { AppError } from "../../../../utils/error";
import { BaseProduct, type BaseProductProps } from "../BaseProduct";
import type { ProductCategory } from "../ProductCategory";

export interface FilmProps extends BaseProductProps {
  width: number;
  thickness: number;
  filmType: string;
}

export class Film<T extends ProductCategory = "film"> extends BaseProduct<T> {
  readonly categoryName: T = "film" as unknown as T;
  readonly subCategoryName: "granule" | "film" = "granule";

  protected readonly WIDTH_MIN = 30;
  protected readonly WIDTH_MAX = 100;

  protected readonly THICKNESS_MIN = 25;
  protected readonly THICKNESS_MAX = 100;

  protected _filmType!: FilmTypes;

  protected _width: number = 30;
  protected _thickness: number = 25;

  constructor(props: FilmProps) {
    super(props);

    this.width = props.width;
    this.thickness = props.thickness;

    this.filmType = props.filmType as FilmTypes;
  }

  set width(width: number) {
    if (Number.isNaN(width))
      throw new AppError("DOMAIN", "Ширина має бути числом");

    if (width < this.WIDTH_MIN || width > this.WIDTH_MAX) {
      throw new AppError(
        "DOMAIN",
        `Ширина має бути не менше ${this.WIDTH_MIN}см і не більше ${this.WIDTH_MAX}см`,
      );
    }

    this._width = width;
  }
  get width() {
    return this._width;
  }

  set thickness(thickness: number) {
    if (Number.isNaN(thickness))
      throw new AppError("DOMAIN", "Товщина має бути числом");

    if (thickness < this.THICKNESS_MIN || thickness > this.THICKNESS_MAX) {
      throw new AppError(
        "DOMAIN",
        `Товщина має бути не менше ${this.THICKNESS_MIN}мкм і не більше ${this.THICKNESS_MAX}мкм`,
      );
    }

    this._thickness = thickness;
  }

  get thickness() {
    return this._thickness;
  }

  set filmType(filmType: FilmTypes) {
    if (!["fabric", "half_sleeve", "pocket", "sleeve"].includes(filmType)) {
      throw new AppError("DOMAIN", "Невідомий тип плівки");
    }

    this._filmType = filmType;
  }

  get filmType() {
    return this._filmType;
  }

  static override get fieldsToCreate(): CreateFilmFieldsDTO {
    return {
      ...super.fieldsToCreate,
      width: 0,
      thickness: 0,
      filmTypes: ["fabric", "half_sleeve", "pocket", "sleeve"],
      subCategoryName: "granule",
    };
  }

  override getFields() {
    return {
      ...super.getFields(),
      width: this.width,
      thickness: this.thickness,
      filmType: this.filmType,
      subCategoryName: "granule",
    };
  }

  toPersistence(): ProductDataFilmDTO {
    return {
      id: this.id,
      createdAt: this.createdAt,
      updatedAt: Date.now(),
      categoryName: this.categoryName,
      totalAmount: this.totalAmount,
      quantity: this.quantity,
      name: this.name,
      price: this.price,
      width: this.width,
      thickness: this.thickness,
      unit: this.unit,
      filmType: this.filmType,
    };
  }
}
