import type { ProductToCreateFieldDTO } from "../../../../dto/ProductToCreateDTO";
import { AppError } from "../../../../utils/error";
import { BaseProduct, type BaseProductProps } from "../BaseProduct";

export interface BagProps extends BaseProductProps {
  width: number;
  length: number;
  thickness: number;
  quantity: number;
}

export class Bag extends BaseProduct {
  protected length: number;
  protected thickness: number;
  protected quantity: number;
  protected width: number;
  protected weight: number;

  constructor(props: BagProps) {
    super(props);

    this.width = !!props.width ? props.width : 0;
    this.length = !!props.length ? props.length : 0;
    this.thickness = !!props.thickness ? props.thickness : 0;
    this.quantity = !!props.quantity ? props.quantity : 0;

    this.weight = this.getWeight();
    this.price = this.getPrice();
    this.totalAmount = this.getTotalAmount(this.quantity);
  }

  override getTotalAmount(quantity: number) {
    let totalAmount = 0;

    try {
      const weight = this._getBagWeight(quantity);
      const price = this.price;

      totalAmount = Number(Number(weight * price).toFixed(2));

      if (Number.isNaN(totalAmount)) {
        throw new AppError("DOMAIN", "Помилка обчислення вартості пакета");
      }
    } catch (error) {
      console.error(error);
    }

    return totalAmount;
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

  private _getBagWeight(q: number) {
    try {
      const result = Number(
        Number(
          this.length *
            0.01 *
            this.width *
            0.01 *
            (this.thickness * 0.001 * 2 * q),
        ).toFixed(3),
      );

      if (Number.isNaN(result)) {
        throw new AppError("DOMAIN", "Помилка обчислення ваги пакета");
      }

      return result;
    } catch (error) {
      console.error(error);
    }

    return 0;
  }

  override getWeight(): number {
    return this._getBagWeight(this.quantity);
  }

  private readonly WIDTH_MIN: number = 30;
  private readonly WIDTH_MAX: number = 100;

  private readonly THICKNESS_MIN: number = 25;
  private readonly THICKNESS_MAX: number = 100;

  private readonly LENGTH_MIN: number = 25;
  private readonly LENGTH_MAX: number = 200;

  override isValid(): boolean {
    return (
      this.quantity >= 0 &&
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

  override getFields(): ProductToCreateFieldDTO[] {
    return [
      {
        name: "weight",
        title: "Вага (кг)",
        fieldType: "number",
        value: this.getWeight(),
        placeholder: "",
        disabled: true,
      },
      {
        name: "pricePerItem",
        title: "Ціна за штуку (грн.)",
        fieldType: "number",
        value: this.getPricePerItem(),
        disabled: true,
      },
      {
        name: "name",
        title: "Назва продукту",
        fieldType: "text",
        value: this.name,
        placeholder: "",
      },
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
        placeholder: "",
      },
    ];
  }

  override setQuantity(value: number) {
    if (!Number.isInteger(value))
      throw new AppError("DOMAIN", "Кількість має бути цілим числом");
    if (value < 0)
      throw new AppError("DOMAIN", "Кількість не може бути нижче нуля");

    this.quantity = value;

    this.totalAmount = this.getTotalAmount(this.quantity);

    return this;
  }
}
