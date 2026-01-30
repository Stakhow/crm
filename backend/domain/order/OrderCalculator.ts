import { BaseProduct } from '@/domain/product/BaseProduct';
import { OrderItem } from './OrderItem';

export class OrderCalculator {
  calculateSubtotal(items: OrderItem[]): number {
    return items.reduce(
      (sum, item) => sum + item.product.getTotalPrice() * item.quantity,
      0
    );
  }

  applyDiscount(subtotal: number, discountPercent: number): number {
    return subtotal * (1 - discountPercent / 100);
  }

  calculateTotal(
    items: OrderItem[],
    discountPercent: number,
    deliveryPrice: number
  ): number {
    const subtotal = this.calculateSubtotal(items);
    const discounted = this.applyDiscount(subtotal, discountPercent);

    return discounted + deliveryPrice;
  }
}
