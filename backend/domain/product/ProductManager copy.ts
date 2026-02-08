import { ProductCategory } from "./ProductCategory";
import { ProductByCategory } from "./ProductByCategory";
import { type IFactory } from "./../../shared/factory/IFactory";

type ProductCtor<C extends ProductCategory> = (typeof ProductByCategory)[C];

type ProductCtorArgs<C extends ProductCategory> = ConstructorParameters<
  ProductCtor<C>
>;

export type ProductInstance<C extends ProductCategory> = InstanceType<
  ProductCtor<C>
>;

export class ProductManager {
  constructor(private factory: IFactory) {}

  createByCategory<C extends ProductCategory>(
    category: C,
    ...args: ProductCtorArgs<C>
  ): ProductInstance<C> {
    const Ctor = ProductByCategory[category];

    if (!Ctor) {
      throw new Error(`Unsupported product category: ${category}`);
    }

    return this.factory.create(Ctor, ...args);
  }

  getClassByCategory<C extends ProductCategory>(category: C): ProductCtor<C> {
    return ProductByCategory[category];
  }
}
