import type { ProductFormValuesDTO } from "../../../../dto/ProductFormValuesDTO";
import type { ProductToCreateFieldDTO } from "../../../../dto/ProductToCreateDTO";
import { AppError } from "../../../../utils/error";
import { BaseProduct, type BaseProductProps } from "../BaseProduct";

export interface BagProps extends BaseProductProps {
  width?: number;
  length?: number;
  thickness?: number;
  quantity?: number;
}

export class Bag extends BaseProduct {
  private length: number;
  private thickness: number;
  private quantity: number;
  private width: number;

  constructor(props: BagProps) {
    super(props);

    this.width = props.width ?? 0;
    this.length = props.length ?? 0;
    this.thickness = props.thickness ?? 0;
    this.quantity = props.quantity ?? 0;

    this.param = this.quantity;
  }

  set setName(name: string) {
    this.name = name;
  }

  set setLength(v: number) {
    this.length = v;
  }
  set setWidth(v: number) {
    this.width = v;
  }
  set setThickness(v: number) {
    this.thickness = v;
  }

  set setQuantity(v: number) {
    this.quantity = v;
  }

  override fillData(data: ProductFormValuesDTO) {
    this.selectModifiers(data);

    const values = data.fields;

    this.setName = values.name ? String(values.name) : this.name;
    this.setWidth = +values.width ? +values.width : this.width;
    this.setThickness = +values.thickness ? +values.thickness : this.thickness;
    this.setLength = +values.length ? +values.length : this.length;
    this.setQuantity = +values.quantity ? +values.quantity : this.quantity;
    this.setWeight = this._getWeight();

    this.autofillName();

    this.setTotalAmount();

    return this;
  }

  override autofillName(): void {
    if (!this.name) {
      this.name = [
        this.category.title,
        this.width,
        this.length,
        this.thickness,
      ].join("/");
    }
  }

  private _getWeight(): number {
    if (
      this.length > 0 &&
      this.width > 0 &&
      this.thickness > 0 &&
      this.quantity > 0
    )
      return Number(
        (
          this.length *
          0.01 *
          this.width *
          0.01 *
          (this.thickness * 0.001 * 2 * this.quantity)
        ).toFixed(3),
      );
    else return 0;
  }

  private readonly WIDTH_MIN: number = 30;
  private readonly WIDTH_MAX: number = 100;

  private readonly THICKNESS_MIN: number = 25;
  private readonly THICKNESS_MAX: number = 100;

  private readonly LENGTH_MIN: number = 25;
  private readonly LENGTH_MAX: number = 200;

  override isValid(): boolean {
    return (
      this.weight >= 0 &&
      this.width >= this.WIDTH_MIN &&
      this.width <= this.WIDTH_MAX &&
      this.thickness >= this.THICKNESS_MIN &&
      this.thickness <= this.THICKNESS_MAX &&
      this.length >= this.LENGTH_MIN &&
      this.length <= this.LENGTH_MAX &&
      this.quantity >= 0 &&
      this.price > 0
    );
  }

  override getSpecialFields(): ProductToCreateFieldDTO[] {
    return [
      {
        name: "width",
        title: "Ширина (см)",
        fieldType: "number",
        value: this.width,
        placeholder: `${this.WIDTH_MIN} - ${this.WIDTH_MAX}`,
      },
      {
        name: "length",
        title: "Довжина (см)",
        fieldType: "number",
        value: this.length,
        placeholder: `${this.LENGTH_MIN} - ${this.LENGTH_MAX}`,
      },
      {
        name: "thickness",
        title: "Товщина (мкм)",
        fieldType: "number",
        value: this.thickness,
        placeholder: `${this.THICKNESS_MIN} - ${this.THICKNESS_MAX}`,
      },
      {
        name: "quantity",
        title: "Кількість (шт.)",
        fieldType: "number",
        value: this.quantity,
      },
    ];
  }

  override get mainParam() {
    return this.quantity;
  }

  override setMainParam(value: number): void {
    if (value < 0) throw new AppError("DOMAIN", "quantity cannot be negative");

    this.setQuantity = value;

    this.param = value;

    this.setWeight = this._getWeight();

    this.setTotalAmount();
  }
}
