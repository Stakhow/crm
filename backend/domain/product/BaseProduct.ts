import type { ProductCategory } from "../../domain/product/ProductCategory";
import { AppError } from "../../../utils/error";
import type { ProductDataDTO } from "../../../dto/ProductDataDTO";
import type { ProductModifier } from "./modifiers/ProductModifier";
import type { ProductViewDTO } from "./../../../dto/ProductViewDTO";
import type { ProductToCreateDTO, ProductToCreateFieldDTO } from "../../../dto/ProductToCreateDTO";
import type { ProductFormValuesDTO } from "../../../dto/ProductFormValuesDTO";

export interface BaseProductProps {
  id: number | undefined;
  createdAt?: string;
  category: {
    id: number;
    name: ProductCategory;
    title: string;
  };
  modifiers?: ProductModifier[];
  name?: string;
  weight?: number;
  price: number;
  totalAmount: number;
}

export abstract class BaseProduct {
  protected id: number | undefined;
  protected createdAt: string;

  protected category: {
    id: number;
    name: ProductCategory;
    title: string;
  };

  private availableModifiers: ProductModifier[];

  public name: string;
  protected modifiers: ProductModifier[] | [];
  protected weight: number;
  protected price: number;
  protected totalAmount: number;

  protected constructor(props: BaseProductProps) {
    this.id = props.id ?? undefined;
    this.createdAt = props.createdAt ?? ""; // 0 for new objects

    this.category = props.category;
    this.name = props.name ?? "";
    this.weight = props.weight ?? 0;

    this.modifiers = props.modifiers ?? [];
    this.availableModifiers = [];

    if (!props.category) throw new AppError("DOMAIN", "Не вказана категорія");

    if (!!props.modifiers) {
      this.availableModifiers = this.modifiers.filter((i) =>
        i.category.includes(this.category.name),
      );
    }

    this.price = props.price ?? 0;
    this.setPrice();

    this.totalAmount = props.totalAmount ?? 0;

    this.setTotalAmount();
  }

  get getPrice() {
    return this.price;
  }

  selectModifiers(values: ProductFormValuesDTO) {
    this.modifiers = this.availableModifiers
      .filter((i) => values.modifiers.hasOwnProperty(i.id))
      .map((i) => {
        i.select(values.modifiers[i.id]);
        return i;
      });

    this.setPrice();
  }

  set setWeight(value: number) {
    if (!Number.isNaN(value)) {
      this.weight = value;
    }
  }

  fillData(data: ProductFormValuesDTO) {
    this.selectModifiers(data);

    const values = data.fields;

    this.name = values.name ? String(values.name) : this.name;
    this.weight = +values.weight ? +values.weight : this.weight;

    this.fillName();
    this.setTotalAmount();

    return this;
  }
  protected applyModifiers(): number {
    return this.modifiers.reduce((price, modifier) => modifier.apply(price), 0);
  }

  isValid(): boolean {
    return this.weight >= 0 && this.price > 0;
  }

  get modifiersPersistence() {
    return this.modifiers.map((i) => i.toDTO());
  }

  toPersistence(): ProductDataDTO {
    return {
      name: this.name,
      category: this.category,
      categoryName: this.category.name,
      weight: this.weight,
      ...Object.fromEntries(this.getFields().map((i) => [[i.name], i.value])),
    };
  }

  protected setPrice() {
    // this.price = Number(this.applyModifiers().toFixed(2));
    this.price = Number(this.applyModifiers());
  }

  public getTotalAmount(): number {
    return this.totalAmount;
  }

  protected setTotalAmount() {
    this.totalAmount = Number((this.weight * this.price).toFixed(2));
  }

  protected fillName(): void {
    if (!this.name) this.name = `${this.category.title}`;
  }

  getPropsForCreate() {
    return {
      category: this.category,
      modifiers: this.availableModifiers.map((i) => i.showFullData()),
      fields: [
        // ...this.availableModifiers.map((i) => i.id),
        ...this.getFields().map((i) => ({
          name: i.name,
          value: i.value,
        })),
      ],
    };
  }

  protected getSpecialFields(): ProductToCreateFieldDTO[] {
    return [];
  }

  getFields() {
    return [
      {
        name: "weight",
        title: "Вага (кг)",
        fieldType: "number",
        value: this.weight || "",
      },
      {
        name: "name",
        title: "Назва продукту",
        fieldType: "text",
        value: this.name,
      },
      ...this.getSpecialFields(),
    ];
  }

  toView(): ProductViewDTO {
    return {
      id: this.id || 0, // TODO
      createdAt: this.createdAt,
      name: this.name,
      category: this.category,
      categoryName: this.category.name,
      weight: this.weight,
      modifiers: this.modifiers.map((i) => i.toView()),
      price: this.price,
      totalAmount: this.totalAmount,
      fields: this.getFields().map(({ title, value, name }) => ({
        title,
        value,
        name,
      })),
    };
  }

  calculate() {
    return {
      sum: this.getTotalAmount(),
      isValid: this.isValid(),
      price: this.price,
    };
  }

  toCreate(): ProductToCreateDTO {
    const { category, fields, modifiers } = this.getPropsForCreate();
    const extendedFields = this.getFields();

    const initialValues: ProductToCreateDTO["initialValues"] = {
      modifiers: this.availableModifiers.map((i) => i.toDTO()),
      fields,
    };

    return {
      category,
      modifiers,
      initialValues,
      extendedFields,
      price: this.price,
    };
  }

  protected get mainParam() {
    return this.weight;
  }

  updateMainParam(value: number, unitOperation: "add" | "subtract") {
    let result = 0;

    if (unitOperation === "add") result = this.mainParam + Number(value);
    if (unitOperation === "subtract") result = this.mainParam - Number(value);

    this.setMainParam(result);
  }

  setMainParam(value: number) {
    if (value < 0) throw new AppError("DOMAIN", "weight cannot be negative");

    this.setWeight = value;

    this.setTotalAmount();
  }
}
