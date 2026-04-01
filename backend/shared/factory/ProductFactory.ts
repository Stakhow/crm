import type { IProductFactory } from "./IProductFactory";

export class ProductFactory implements IProductFactory {
  create<C extends new (args: any) => any>(
    ctor: C,
    args: ConstructorParameters<C>[0],
  ): InstanceType<C> {
    return new ctor(args);
  }
}
