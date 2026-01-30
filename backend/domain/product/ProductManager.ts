import { ProductCategory } from './ProductCategory';
import { ProductByCategory } from './ProductByCategory';
import { type IFactory } from './../../shared/factory/IFactory';

export class ProductManager {
  constructor(private factory: IFactory) {}

  createByCategory<C extends ProductCategory>(
    category: C,
    ...args: ConstructorParameters<typeof ProductByCategory[C]>
  ): InstanceType<typeof ProductByCategory[C]> {
    const Ctor = ProductByCategory[category];

    if (!Ctor) {
      throw new Error(`Unsupported product category: ${category}`);
    }

    return this.factory.create(Ctor, ...args);
  }
}