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
}

export class Film<T extends ProductCategory = "film"> extends BaseProduct<T> {
  readonly categoryName: T = "film" as unknown as T;

  protected readonly WIDTH_MIN: number = 30;
  protected readonly WIDTH_MAX: number = 100;

  protected readonly THICKNESS_MIN: number = 25;
  protected readonly THICKNESS_MAX: number = 100;

  // private readonly filmTypes: FilmTypes[] = [
  //   "fabric",
  //   "half sleeve",
  //   "pocket",
  //   "sleeve",
  // ];
  private readonly filmType: FilmTypes = "sleeve";

  protected readonly width: number;
  protected readonly thickness: number;

  constructor(props: FilmProps) {
    super(props);

    if (props.width < this.WIDTH_MIN || props.width > this.WIDTH_MAX) {
      throw new AppError(
        "DOMAIN",
        `Ширина має бути не менше ${this.WIDTH_MIN}см і не більше ${this.WIDTH_MAX}см`,
      );
    }
    this.width = props.width;

    if (
      props.thickness < this.THICKNESS_MIN ||
      props.thickness > this.THICKNESS_MAX
    ) {
      throw new AppError(
        "DOMAIN",
        `Товщина має бути не менше ${this.THICKNESS_MIN}мкм і не більше ${this.THICKNESS_MAX}мкм`,
      );
    }
    this.thickness = props.thickness;
  }

  static override get fieldsToCreate(): CreateFilmFieldsDTO {
    return {
      ...super.fieldsToCreate,
      width: 0,
      thickness: 0,
      filmTypes: ["fabric", "half sleeve", "pocket", "sleeve"],
    };
  }

  override getFields() {
    return {
      ...super.getFields(),
      width: this.width,
      thickness: this.thickness,
      filmType: this.filmType,
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
    };
  }
}

// рукав
// полурукав
// полотно
// карман
