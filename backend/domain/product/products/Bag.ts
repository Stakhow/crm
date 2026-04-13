import type { ProductToCreateDTO } from "../../../../dto/ProductToCreateDTO";
import type { ProductToCreateFieldDTO } from "../../../../dto/ProductToCreateDTO";
import { AppError } from "../../../../utils/error";
import { BaseProduct, type BaseProductProps } from "../BaseProduct";

export interface BagProps extends BaseProductProps {
  width: number;
  length: number;
  thickness: number;
  quantity: number;
  pricePerItem?: number;
}

export class Bag extends BaseProduct {
  private length: number;
  private thickness: number;
  protected quantity: number;
  protected weight: number;
  private width: number;
  private pricePerItem: number;

  constructor(props: BagProps) {
    super(props);

    this.width = props.width;

    this.length = props.length;
    this.thickness = props.thickness;
    this.quantity = props.quantity;
    this.weight = this.getWeight();

    this.pricePerItem = props.pricePerItem ?? 0;

    this.totalAmount = this.getTotalAmount();
  }

  override getTotalAmount() {
    try {
      const totalAmount = Number((this.weight * this.price).toFixed(2));

      if (Number.isNaN(totalAmount))
        throw new AppError("DOMAIN", "Помилка обчислення вартості пакета");

      return totalAmount;
    } catch (error) {
      console.error(error);
      return 0;
    }
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

  override getWeight(): number {
    try {
      const weight = Number(
        (
          this.length *
          0.01 *
          this.width *
          0.01 *
          (this.thickness * 0.001 * 2 * this.quantity)
        ).toFixed(3),
      );

      if (Number.isNaN(weight)) {
        console.log(`this.length`, this.length);
        console.log(`this.width`, this.width);
        console.log(`this.thickness`, this.thickness);
        console.log(`this.quantity`, this.quantity);
        throw new AppError("DOMAIN", "Помилка обчислення ваги пакета");
      }

      return (this.weight = weight);
    } catch (error) {
      console.error(error);

      return (this.weight = 0);
    }
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

  getPricePerItem(): number {
    try {
      const result = Number((this.totalAmount / this.quantity).toFixed(2));

      if (Number.isNaN(result)) {
        console.log("this.totalAmount", this.totalAmount);
        console.log("this.quantity", this.quantity);

        throw new AppError("DOMAIN", "Помилка обчислення ціну пакета за штуку");
      }

      return (this.pricePerItem = result);
    } catch (error) {
      return (this.pricePerItem = 0);
    }
  }

  override getFields(): ProductToCreateFieldDTO[] {
    return [
      {
        name: "weight",
        title: "Вага (кг)",
        fieldType: "number",
        value: this.weight,
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

  override setQuantity(value: number): void {
    if (!Number.isInteger(value))
      throw new AppError("DOMAIN", "Кількість має бути цілим числом");
    if (value < 0)
      throw new AppError("DOMAIN", "Кількість не може бути нижче нуля");

    this.quantity = value;

    this.weight = this.getWeight();

    this.getTotalAmount();
  }
}
