// application/services/OrderService.ts
export class OrderService {
  constructor(
    private productManager: ProductManager,
    private calculator: OrderCalculator,
    private orderRepository: IOrderRepository
  ) {}

  async execute(dto: OrderDTO): Promise<Order> {
    const product = this.productManager.createByCategory(
      dto.category,
      ...dto.productArgs
    );

    const price = this.calculator.calculate(product);

    const order = new Order(
      crypto.randomUUID(),
      dto.clientId,
      product,
      price,
      new Date()
    );

    await this.orderRepository.save(order);
    return order;
  }
}

// class OrderService {
//   constructor(
//     private calculator: OrderCalculator,
//     private orderRepo: OrderRepository
//   ) {}

//   create(items: OrderItem[]) {
//     const total = this.calculator.calculateTotal(items, 10, 100);
//     // save order
//   }
// }
