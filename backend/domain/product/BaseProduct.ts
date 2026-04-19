import type { ProductCategory } from "../../domain/product/ProductCategory";
import { AppError } from "../../../utils/error";
import type { ProductDataDTO } from "../../../dto/ProductDataDTO";
import type { ProductModifier } from "./modifiers/ProductModifier";
import type { ProductViewDTO } from "./../../../dto/ProductViewDTO";
import type {
  ProductToCreateDTO,
  ProductToCreateFieldDTO,
} from "../../../dto/ProductToCreateDTO";

type AppliedModifiersType = Record<number, number>;

export interface BaseProductProps {
  id: number;
  createdAt: number;
  updatedAt: number;
  category: {
    id: number;
    name: ProductCategory;
    title: string;
  };
  modifiers: ProductModifier[];
  name: string;
  quantity: number;
  price: number;
  pricePerItem?: number;
  totalAmount: number;
  appliedModifiers: AppliedModifiersType;
}

export abstract class BaseProduct {
  public readonly id: number;
  protected createdAt: number;
  protected updatedAt: number;

  protected category: {
    id: number;
    name: ProductCategory;
    title: string;
  };

  public appliedModifiers: AppliedModifiersType;

  public name: string;
  protected modifiers: ProductModifier[];
  protected quantity: number;
  protected price: number;
  protected totalAmount: number;

  protected constructor(props: BaseProductProps) {
    this.id = props.id;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;

    if (!props.category) throw new AppError("DOMAIN", "Не вказана категорія");
    this.category = props.category;

    this.name = props.name ?? "";
    this.quantity = props.quantity;

    if (!props.modifiers || !props.modifiers.length)
      throw new AppError("DOMAIN", "Не вказані модифікатори");
    this.modifiers = props.modifiers;
    this.appliedModifiers = props.appliedModifiers ?? [];
    this.price = props.price ?? 0;

    this.totalAmount = 0;
  }

  selectModifiers(values: ProductToCreateDTO) {
    this.appliedModifiers = values.modifiers.reduce((acc, current) => {
      acc[current.id] = current.value;
      return acc;
    }, {} as AppliedModifiersType);
  }

  get getQuantity() {
    return this.quantity;
  }

  fillData(data: ProductToCreateDTO) {
    this.selectModifiers(data);

    const values = data.fields;

    values.map((i) => {
      if (i.name in this) {
        // @ts-ignore
        this[i.name] = i.value;
      }
    });

    this.autofillName();
    this.price = this.getPrice();

    this.totalAmount = this.getTotalAmount(this.quantity);

    this.isValid();

    return this;
  }
  protected getPrice(): number {
    return this.modifiers.reduce((price, modifier) => {
      modifier.select(this.appliedModifiers[modifier.id]);

      return modifier.apply(price);
    }, 0);
  }

  isValid(): boolean {
    const isValid = this.quantity >= 0 && this.price > 0;
    if (!isValid) throw new AppError("DOMAIN", "Ціна не вказана");

    return isValid;
  }

  getPricePerItem(): number {
    try {
      const res = Number((this.totalAmount / this.quantity).toFixed(2));

      if (Number.isNaN(res)) {
        throw new AppError("DOMAIN", "Помилка обчислення ціну пакета за штуку");
      }

      return res;
    } catch (error) {}

    return 0;
  }

  get modifiersPersistence() {
    return this.modifiers.map((i) => i.toDTO());
  }

  toPersistence(): ProductDataDTO {
    return {
      name: this.name,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      category: this.category,
      categoryName: this.category.name,
      quantity: this.quantity,
      ...Object.fromEntries(this.getFields().map((i) => [[i.name], i.value])),
    };
  }

  public getTotalAmount(quantity: number) {
    const totalAmount = Number((quantity * this.price).toFixed(2));

    try {
      if (Number.isNaN(totalAmount)) {
        throw new AppError("DOMAIN", "Помилка обчислення вартості продукта");
      }
    } catch (error) {
      console.log(error);
    }

    return totalAmount;
  }

  protected autofillName(): void {
    if (!this.name) this.name = `${this.category.title}`;
  }

  public getWeight() {
    return this.quantity;
  }

  getFields(): ProductToCreateFieldDTO[] {
    return [
      {
        name: "quantity",
        title: "Вага (кг)",
        fieldType: "number",
        value: this.quantity,
        placeholder: "",
      },
      {
        name: "name",
        title: "Назва продукту",
        fieldType: "text",
        value: this.name,
        placeholder: "",
      },
    ];
  }

  toView(): ProductViewDTO {
    return {
      id: this.id,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      name: this.name,
      category: this.category,
      categoryName: this.category.name,
      quantity: this.quantity,
      modifiers: this.modifiers.map((i) => i.toView()),
      price: this.price,
      totalAmount: this.getTotalAmount(this.quantity),
      fields: this.getFields()
        .filter((i) => !["name"].includes(i.name))
        .map(({ title, value, name }) => ({
          title,
          value,
          name,
        })),

      productToCreate: this.toCreate(),
      isAvailable: this.isAvailable(),
    };
  }

  toCreate(): ProductToCreateDTO {
    const fields = this.getFields();
    const modifiers = this.modifiers.map((i) => i.showFullData());

    return {
      price: this.price,
      categoryName: this.category.name,
      fields,
      quantity: this.quantity,

      modifiers: modifiers.map((mod) => ({
        ...mod,
        value:
          mod.list.find((i) => i.id === this.appliedModifiers[mod.id])?.id ??
          mod.list[0].id,
      })),
    };
  }

  updateQuantity(value: number, unitOperation: "add" | "subtract") {
    let result = 0;

    if (unitOperation === "add") result = this.quantity + Number(value);
    if (unitOperation === "subtract") result = this.quantity - Number(value);

    this.setQuantity(result);
  }

  setQuantity(value: number) {
    if (value < 0)
      throw new AppError("DOMAIN", `Вага не може бути нижче нуля: ${value}`);

    this.quantity = value;
  }

  isAvailable() {
    return this.quantity > 0;
  }
}
