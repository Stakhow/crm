import type { ProductFormValuesDTO } from "../../../../dto/ProductFormValuesDTO";
import type { ProductToCreateFieldDTO } from "../../../../dto/ProductToCreateDTO";
import { BaseProduct, type BaseProductProps } from "../BaseProduct";

export interface FilmProps extends BaseProductProps {
  width?: number;
  thickness?: number;
}

export class Film extends BaseProduct {
  protected width: number;
  protected thickness: number;

  constructor(props: FilmProps) {
    super(props);
    this.category = props.category;
    this.width = props.width ?? 0;
    this.thickness = props.thickness ?? 0;
  }

  set setWidth(v: number) {
    this.width = v;
  }

  set setThickness(v: number) {
    this.thickness = v;
  }

  override fillData(data: ProductFormValuesDTO) {
    this.selectModifiers(data);

    const values = data.fields;

    this.name = values.name ? String(values.name) : this.name;
    this.width = +values.width ? +values.width : this.width;
    this.weight = +values.weight ? +values.weight : this.weight;
    this.thickness = +values.thickness ? +values.thickness : this.thickness;

    this.autofillName();

    this.setTotalAmount();

    return this;
  }

  override autofillName(): void {
    if (!this.name) {
      this.name = [this.category.title, this.width, this.thickness].join("/");
    }
  }

  private readonly WIDTH_MIN: number = 30;
  private readonly WIDTH_MAX: number = 100;

  private readonly THICKNESS_MIN: number = 25;
  private readonly THICKNESS_MAX: number = 100;

  override isValid(): boolean {
    return (
      this.weight >= 0 &&
      this.width >= this.WIDTH_MIN &&
      this.width <= this.WIDTH_MAX &&
      this.thickness >= this.THICKNESS_MIN &&
      this.thickness <= this.THICKNESS_MAX &&
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
        name: "thickness",
        title: "Товщина (мкм)",
        fieldType: "number",
        value: this.thickness,
        placeholder: `${this.THICKNESS_MIN} - ${this.THICKNESS_MAX}`,
      },
    ];
  }
}
