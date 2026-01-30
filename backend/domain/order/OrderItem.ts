import { BaseProduct } from '@/domain/product/BaseProduct';

export class OrderItem {
  constructor(
    public readonly product: BaseProduct,
    public readonly quantity: number
  ) {}
}
