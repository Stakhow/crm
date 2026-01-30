import ProductManager  from '../domain/productManager';

export class CreateProductService {
  constructor(
    private productManager: ProductManager
  ) {}
// execute(dto: CreateProductDTO) {
  execute(dto) {
    return this.productManager.createByCategory(
      dto.category,
      dto.id,
      dto.price,
      dto.extra
    );
  }
}