import { ProductManager } from "../domain/product/ProductManager";
import { ProductModifier } from "../domain/product/modifiers/ProductModifier";
import { type ProductCategory } from "./../domain/product/ProductCategory";
import { ProductByCategory } from "../domain/product/ProductByCategory";
import { AppError } from "../../utils/error";
import type { ProductRepository } from "../repositories/product/ProductRepository";
import type { ProductViewDTO } from "../../dto/ProductViewDTO";
import type { ProductModifierItemDTO } from "../../dto/ProductModifierItemDTO";
import type { ProductToCreateDTO } from "../../dto/ProductToCreateDTO";

export class ProductService {
  constructor(
    private productManager: ProductManager,
    private productRepository: ProductRepository,
  ) {
    this.productManager = productManager;
    this.productRepository = productRepository;
  }

  private async _create(
    categoryName: ProductCategory,
  ): Promise<InstanceType<(typeof ProductByCategory)[ProductCategory]>> {
    const category = this._getCategory(categoryName);

    if (!category) throw new AppError("SERVICE", "Категорію не знайдено");

    const modifiers =
      await this.productRepository.getAllModifiers(categoryName);

    const props = {
      id: 0,
      category,
      modifiers,
      price: 0,
      totalAmount: 0,
      name: "",
      length: 0,
      width: 0,
      thickness: 0,
      weight: 0,
      quantity: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      appliedModifiers: [],
    };

    return this.productManager.createByCategory(categoryName, props);
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

  public async init(categoryName: ProductCategory) {
    const product = await this._create(categoryName);
    return product.toCreate();
  }
  public async initToEdit(productId: number) {
    const product = await this.productRepository.getById(productId);

    return product.toCreate();
  }

  public async createProduct(
    categoryName: ProductCategory,
    values: ProductToCreateDTO,
  ): Promise<number> {
    const product = await this._create(categoryName);

    return new Promise((resolve, reject) => {
      product.fillData(values);

      if (product.toView().quantity === 0)
        throw new AppError("DOMAIN", "Неправильні дані продукту");

      if (product.isValid()) resolve(this.productRepository.save(product));
      else reject({ values, product: product });
    });
  }

  public async getAll() {
    const products = await this.productRepository.getAll();

    return products.map((i) => i.toView());
  }

  public async delete(id: number) {
    return await this.productRepository.delete(id);
  }

  public async calculateDraft(
    id: number,
    values: ProductToCreateDTO,
  ): Promise<ProductToCreateDTO> {
    const product = !!id
      ? await this.getProduct(id)
      : await this._create(values.categoryName);

    if (!product)
      throw new AppError("SERVICE", "Помилка при створенні продукту");
    return new Promise((resolve, reject) => {
      try {
        product.fillData(values);
        resolve(product.toCreate());
      } catch (error) {
        console.log(error);
        reject(error);
      }
    });
  }
  public async getTotalAmount(id: number, value: number): Promise<number> {
    const product = await this.productRepository.getById(id);

    return new Promise((resolve) => {
      resolve(product.getTotalAmount(value));
    });
  }

  public async getByCategory(categoryName: ProductCategory) {
    return await this.productRepository.getByCategory(categoryName);
  }

  _getCategories(): { id: number; name: ProductCategory; title: string }[] {
    const categories: ProductCategory[] = ["film", "bag", "stretch", "granule"];

    return categories.map((category, id) => {
      let title = "";
      switch (category) {
        case "film":
          title = "Плівка";
          break;
        case "bag":
          title = "Пакет";
          break;
        case "stretch":
          title = "Стрейч";
          break;
        case "granule":
          title = "Гранула";
          break;
      }
      return { id, name: category, title };
    });
  }

  private _getCategory(categoryName: ProductCategory) {
    return this._getCategories().find((i) => i.name === categoryName);
  }

  public async getCategories(): Promise<
    { id: number; name: ProductCategory; title: string }[]
  > {
    return this._getCategories();
  }

  public async getProducts(
    category?: ProductCategory | "",
  ): Promise<ProductViewDTO[]> {
    const products = !!category
      ? await this.productRepository.getByCategory(category)
      : await this.productRepository.getAll();

    return products.map((i) => i.toView());
  }

  public async getProduct(productId: number) {
    return await this.productRepository.getById(productId);
  }

  public async getProductByIds(productIds: number[]) {
    return await this.productRepository.getByIds(productIds);
  }

  public async getProductToView(productId: number) {
    const product = await this.productRepository.getById(productId);
    return product.toView();
  }

  public async updateProduct(productId: number, values: ProductToCreateDTO) {
    const product = await this.productRepository.getById(productId);
    return new Promise<any>((resolve, reject) => {
      product.fillData(values);

      this.productRepository.update(productId, product);

      const updatedProduct = this.getProductToView(productId);

      if (product.isValid()) resolve(updatedProduct);
      else reject({ values, product: product });
    });
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
}
