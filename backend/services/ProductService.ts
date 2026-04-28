import {
  ProductModifier,
  type ProductModifierProps,
} from "../domain/product/modifiers/ProductModifier";
import { type ProductCategory } from "./../domain/product/ProductCategory";
import { AppError } from "../../utils/error";
import type { ProductRepository } from "../repositories/product/ProductRepository";
import type { ProductViewDTO } from "../../dto/ProductViewDTO";
import type { ProductToCreateDTO } from "../../dto/ProductToCreateDTO";

export class ProductService {
  constructor(private productRepository: ProductRepository) {
    this.productRepository = productRepository;
  }

  public async getAllModifiers() {
    const mods = await this.productRepository.getAllModifiers();

    return mods.map((i) => i.showFullData());
  }

  public async getModifier(id: number) {
    return this.productRepository.getModifier(id);
  }
  public async getModifierToView(id: number) {
    return (await this.getModifier(id)).showFullData();
  }

  public async saveModifier(data: Omit<ProductModifierProps, "id">) {
    const modifier = new ProductModifier(
      0,
      data.name,
      data.categories,
      data.list,
    );

    const id = await this.productRepository.saveModifier(modifier);

    return await this.getModifierToView(id);
  }

  public async deleteModifier(id: number) {
    const productsId = await this.productRepository.getProductsByModifier(
      Number(id),
    );
    if (productsId.length)
      throw new AppError("DOMAIN", "Модифікатор використовується в продуктах", {
        data: productsId,
      });

    return await this.productRepository.deleteModifier(id);
  }

  public async updateModifier(values: ProductModifierProps) {
    const modifier = await this.productRepository.getModifier(values.id);
    modifier.updateName(values.name);
    modifier.updateCatergories(values.categories);
    modifier.updateList(values.list);

    const id = await this.productRepository.updateModifier(modifier);

    return await this.getModifierToView(id);
  }

  public async getCategories() {
    return await this.productRepository.getCategories();
  }

  public async saveProduct(values: ProductToCreateDTO, productId?: number) {
    const isExistingProduct = !!productId && productId !== 0;
    const product = isExistingProduct
      ? await this.productRepository.getById(productId)
      : await this.productRepository.getByCategoryName(values.categoryName);

    product.fillData(values);

    const id = isExistingProduct
      ? await this.productRepository.update(product)
      : await this.productRepository.save(product);

    return await this.getProductToView(id);
  }

  public async getAll() {
    const products = await this.productRepository.getAll();

    return products.map((i) => i.toView());
  }

  public async delete(id: number): Promise<number> {
    return await this.productRepository.delete(id);
  }

  public async getProductsToView(
    category?: ProductCategory | "",
  ): Promise<ProductViewDTO[]> {
    const products = !!category
      ? await this.productRepository.getProductsByCategory(category)
      : await this.productRepository.getAll();

    return products.map((i) => i.toView());
  }

  public async getProductById(productId: number) {
    return await this.productRepository.getById(productId);
  }

  public async getProductByCategory(categoryName: ProductCategory) {
    return await this.productRepository.getByCategoryName(categoryName);
  }

  public async getProductByIds(productIds: number[]) {
    return await this.productRepository.getByIds(productIds);
  }
  public async getProductByIdsToView(productIds: number[]) {
    const products = await this.getProductByIds(productIds);

    return products.map((i) => i.toView());
  }

  public async getProductByIdsMap(productIds: number[]) {
    const products = await this.productRepository.getByIds(productIds);

    return new Map(products.map((p) => [p.id, p]));
  }
  public async getProductByIdsToViewMap(productIds: number[]) {
    const products = await this.productRepository.getByIds(productIds);

    return new Map(products.map((p) => [p.id, p.toView()]));
  }

  public async getProductToView(
    productId: number,
    categoryName?: ProductCategory,
  ) {
    const product = !!categoryName
      ? await this.getProductByCategory(categoryName)
      : await this.getProductById(productId);

    return product.toView();
  }

  public async updateProductQuantity(
    productId: number,
    {
      unitOperation,
      quantity,
    }: { unitOperation: "add" | "subtract"; quantity: number },
  ) {
    const product = await this.productRepository.getById(productId);

    product.updateQuantity(Number(quantity), unitOperation);

    await this.productRepository.update(product);

    return product.toView();
  }

  public async getTotalAmount(id: number, value: number): Promise<number> {
    const product = await this.productRepository.getById(id);

    return product.getTotalAmount(value);
  }

  public async getByCategory(categoryName: ProductCategory) {
    return await this.productRepository.getProductsByCategory(categoryName);
  }
}
