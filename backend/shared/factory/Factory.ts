import { IFactory } from './IFactory';

export class Factory implements IFactory {
  create<C extends new (...args: any[]) => any>(
    ctor: C,
    ...args: ConstructorParameters<C>
  ): InstanceType<C> {
    return new ctor(...args);
  }
}
