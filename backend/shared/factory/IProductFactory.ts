export interface IProductFactory {
  create<C extends new (args: any) => any>(
    ctor: C,
    args: ConstructorParameters<C>[0],
  ): InstanceType<C>;
}
