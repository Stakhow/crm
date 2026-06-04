import type {
  BagTypes,
  FilmTypes,
  ProductDataBagDTO,
} from "../../../../dto/ProductDataDTO";
import type { CreateBagFieldsDTO } from "../../../../dto/ProductToCreateDTO";
import type { ProductUnitType } from "../../../../dto/ProductViewDTO";

import { AppError } from "../../../../utils/error";
import { Film, type FilmProps } from "./Film";

export interface BagProps extends FilmProps {
  length: number;
  bagType: string;
}

export class Bag extends Film<"bag"> {
  readonly categoryName = "bag";
  readonly subCategoryName = "film";

  private readonly LENGTH_MIN = 25;
  private readonly LENGTH_MAX = 200;
  public readonly unit: ProductUnitType = "piece";

  private _bagType!: BagTypes;
  private _length!: number;

  constructor(props: BagProps) {
    super(props);
    if (!["bag", "handle", "t-shirt"].includes(props.bagType)) {
      throw new AppError("DOMAIN", "Невідомий тип пакета");
    }

    this._bagType = props.bagType as BagTypes;
    this.length = props.length;
  }

  set length(length: number) {
    if (Number.isNaN(length))
      throw new AppError("DOMAIN", "Довжина має бути числом");

    if (length < this.LENGTH_MIN || length > this.LENGTH_MAX) {
      throw new AppError(
        "DOMAIN",
        `Довжина має бути не менше ${this.LENGTH_MIN}см і не більше ${this.LENGTH_MAX}см`,
      );
    }

    this._length = length;
  }

  get length() {
    return this._length;
  }

  override set filmType(filmType: FilmTypes) {
    if (!["sleeve", "pocket"].includes(filmType)) {
      throw new AppError("DOMAIN", "Невідомий тип плівки");
    }

    this._filmType = filmType;
  }

  get bagType() {
    return this._bagType;
  }

  override get weight() {
    return this._calcBagWeight(this.quantity);
  }

  private _calcBagWeight(qty: number) {
    return Number(
      Number(
        this._length *
          0.01 *
          this._width *
          0.01 *
          (this.thickness * 0.001 * 2 * qty),
      ).toFixed(3),
    );
  }

  static override get fieldsToCreate(): CreateBagFieldsDTO {
    return {
      ...super.fieldsToCreate,
      length: 0,
      filmTypes: ["sleeve", "pocket"],
      bagTypes: ["bag", "handle", "t-shirt"],
      subCategoryName: "film",
    };
  }

  override getFields() {
    return {
      ...super.getFields(),
      length: this.length,
      bagType: this.bagType,
      subCategoryName: "film",
    };
  }

  override get weightPerUnit(): number {
    const res = Number(this._calcBagWeight(1).toFixed(3));

    if (Number.isNaN(res)) {
      throw new AppError("DOMAIN", "Помилка обчислення ваги за одиницю");
    }

    return res;
  }

  get pricePerUnit(): number {
    const res = Number(
      (Number(this._calcBagWeight(1).toFixed(3)) * this.price).toFixed(2),
    );

    if (Number.isNaN(res)) {
      throw new AppError("DOMAIN", "Помилка обчислення ціни за одиницю");
    }

    return res;
  }

  toPersistence(): ProductDataBagDTO {
    return {
      id: this.id,
      createdAt: this.createdAt,
      updatedAt: Date.now(),
      categoryName: this.categoryName,
      totalAmount: this.totalAmount,
      quantity: this.quantity,
      name: this.name,
      price: this.price,
      length: this.length,
      width: this.width,
      thickness: this.thickness,
      unit: this.unit,
      filmType: this.filmType,
      bagType: this.bagType,
    };
  }
}
