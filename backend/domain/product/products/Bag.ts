import type {
  BagTypes,
  ProductDataBagDTO,
} from "../../../../dto/ProductDataDTO";
import type { CreateBagFieldsDTO } from "../../../../dto/ProductToCreateDTO";
import type { ProductUnitType } from "../../../../dto/ProductViewDTO";

import { AppError } from "../../../../utils/error";
import { Film, type FilmProps } from "./Film";

export interface BagProps extends FilmProps {
  length: number;
}

export class Bag extends Film<"bag"> {
  readonly categoryName = "bag";
  readonly subCategoryName = "film";

  private readonly LENGTH_MIN: number = 25;
  private readonly LENGTH_MAX: number = 200;
  public readonly unit: ProductUnitType = "piece";

  private readonly bagType: BagTypes = "bag";

  private readonly length: number;

  constructor(props: BagProps) {
    super(props);

    if (props.length < this.LENGTH_MIN || props.length > this.LENGTH_MAX) {
      throw new AppError(
        "DOMAIN",
        `Довжина має бути не менше ${this.LENGTH_MIN}см і не більше ${this.LENGTH_MAX}см`,
      );
    }

    this.length = props.length;
  }

  override get weight() {
    return this._calcBagWeight(this.quantity);
  }

  private _calcBagWeight(qty: number) {
    return Number(
      Number(
        this.length *
          0.01 *
          this.width *
          0.01 *
          (this.thickness * 0.001 * 2 * qty),
      ).toFixed(3),
    );
  }

  static override get fieldsToCreate(): CreateBagFieldsDTO {
    return {
      ...super.fieldsToCreate,
      length: 0,
      bagTypes: ["bag", "handle", "t-shirt"],
    };
  }

  override getFields() {
    return {
      ...super.getFields(),
      length: this.length,
      bagType: this.bagType,
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
    };
  }
}
