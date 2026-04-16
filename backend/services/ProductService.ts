import { ProductModifier } from "../domain/product/modifiers/ProductModifier";
import { type ProductCategory } from "./../domain/product/ProductCategory";
import { AppError } from "../../utils/error";
import type { ProductRepository } from "../repositories/product/ProductRepository";
import type { ProductViewDTO } from "../../dto/ProductViewDTO";
import type { ProductModifierItemDTO } from "../../dto/ProductModifierItemDTO";
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
    return this.productRepository.getModifier(Number(id));
  }

  public async saveModifier(data: {
    name: string;
    categories: ProductCategory[];
    list: ProductModifierItemDTO[];
  }) {
    const mod = new ProductModifier(0, data.name, data.categories, data.list);

    return await this.productRepository.saveModifier(mod);
  }

  public async deleteModifier(id: number) {
    const productsId = await this.productRepository.getProductsByModifier(
      Number(id),
    );
    if (productsId.length)
      throw new AppError(
        "DOMAIN",
        "Помилка видалення: модифікатор використовується в продуктах",
        {
          data: productsId,
        },
      );

    return await this.productRepository.deleteModifier(id);
  }

  public async updateModifier(data: {
    id: number;
    name: string;
    categories: ProductCategory[];
    list: ProductModifierItemDTO[];
  }) {
    const mod = new ProductModifier(
      data.id,
      data.name,
      data.categories,
      data.list,
    );

    return await this.productRepository.updateModifier(mod);
  }

  public async getCategories() {
    return await this.productRepository.getCategories();
  }

  public async saveProduct(values: ProductToCreateDTO, productId?: number) {
    const product =
      !!productId && productId !== 0
        ? await this.productRepository.getById(productId)
        : await this.productRepository.getByCategoryName(values.categoryName);

    // await this._create(values.categoryName);

    return new Promise<any>(async (resolve, reject) => {
      product.fillData(values);

      const id = await this.productRepository.save(product);

      const updatedProduct = this.getProductToView(id);

      setInterval(() => {
        try {
          resolve(updatedProduct);
        } catch (error) {
          reject({ values, product: product });
        }
      }, 2000);
    });
  }

  public async getAll() {
    const products = await this.productRepository.getAll();

    return products.map((i) => i.toView());
  }

  public async delete(id: number) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve(this.productRepository.delete(id));
      }, 3000);
    });

    return await this.productRepository.delete(id);
  }

  public async getProducts(
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

    await this.productRepository.update(productId, product);

    return product.toView();
  }

  public async getTotalAmount(id: number, value: number): Promise<number> {
    const product = await this.productRepository.getById(id);

    return new Promise((resolve) => {
      resolve(product.getTotalAmount(value));
    });
  }

  public async getByCategory(categoryName: ProductCategory) {
    return await this.productRepository.getProductsByCategory(categoryName);
  }
}
