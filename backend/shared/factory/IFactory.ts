export interface IFactory {
  create<C extends new (...args: any[]) => any>(
    ctor: C,
    ...args: ConstructorParameters<C>
  ): InstanceType<C>;
}
