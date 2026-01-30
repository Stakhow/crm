export abstract class BaseProduct {
  protected constructor(
    public readonly id: number,
    public readonly name: string,
    public readonly basePrice: number,
  ) {}

  abstract getTotalPrice(): number;
}
