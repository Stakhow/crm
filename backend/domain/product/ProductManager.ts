import { type ProductCategory } from "./ProductCategory";
import { ProductByCategory } from "./ProductByCategory";
import { type IProductFactory } from "../../shared/factory/IProductFactory";

type ProductCtor<C extends ProductCategory> = (typeof ProductByCategory)[C];

export type ProductCtorArgs<C extends ProductCategory> = ConstructorParameters<
  ProductCtor<C>
>;

export type ProductCreateProps<C extends ProductCategory> =
  ConstructorParameters<(typeof ProductByCategory)[C]>;

export type ProductInstance<C extends ProductCategory> = InstanceType<
  (typeof ProductByCategory)[C]
>;

export class ProductManager {
  constructor(private factory: IProductFactory) {}

  createByCategory<C extends ProductCategory>(
    categoryName: C,
    props: ProductCreateProps<C>[0],
  ): ProductInstance<C> {
    const Ctor = ProductByCategory[categoryName];
    return this.factory.create(Ctor, props);
  }

  getClassByCategory<C extends ProductCategory>(
    categoryName: C,
  ): ProductCtor<C> {
    return ProductByCategory[categoryName];
  }
}
