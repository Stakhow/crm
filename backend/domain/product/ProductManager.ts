import { Category, type ProductCategory } from "./ProductCategory";
import { ProductByCategory } from "./ProductByCategory";
import { type IProductFactory } from "../../shared/factory/IProductFactory";
import type { CreateProductDTO } from "../../../dto/ProductToCreateDTO";

type ProductCreateProps<C extends ProductCategory> = ConstructorParameters<
  (typeof ProductByCategory)[C]
>;

type ProductInstance<C extends ProductCategory> = InstanceType<
  (typeof ProductByCategory)[C]
>;

export class ProductManager {
  constructor(private factory: IProductFactory) {}

  private generateName(values: {
    categoryName: ProductCategory;
    name: string;
    length: number;
    width: number;
    thickness: number;
  }): string {
    const name = values.name ? values.name.trim() : "";

    if (name) return name;

    const categoryTitle = new Category().getTitle(values.categoryName);

    if (
      values.categoryName === "bag" &&
      "length" in values &&
      "width" in values &&
      "thickness" in values
    ) {
      return [
        categoryTitle,
        values.length,
        values.width,
        values.thickness,
      ].join("/");
    }

    if (
      values.categoryName === "film" &&
      "width" in values &&
      "thickness" in values
    ) {
      return [categoryTitle, values.width, values.thickness].join("/");
    }

    return categoryTitle;
  }

  createByCategory<C extends ProductCategory>(
    categoryName: C,
    props: ProductCreateProps<C>[0],
  ): ProductInstance<C> {
    const Ctor = ProductByCategory[categoryName];

    if (!props.name) {
      props.name = this.generateName({
        categoryName: props.categoryName,
        name: props.name, // @ts-ignore
        length: props.length, // @ts-ignore
        width: props.width, // @ts-ignore
        thickness: props.thickness,
      });
    }

    return this.factory.create(Ctor, props);
  }

  getPropsToCreate<C extends ProductCategory>(
    categoryName: C,
  ): CreateProductDTO {
    return {
      fields: ProductByCategory[categoryName].fieldsToCreate,
      categoryName,
    };
  }
}
