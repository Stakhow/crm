import {
  ProductModifier,
  type ProductModifierProps,
} from "../domain/product/modifiers/ProductModifier";
import { type ProductCategory } from "./../domain/product/ProductCategory";
import { AppError } from "../../utils/error";
import type { ProductRepository } from "../repositories/product/ProductRepository";
import type { ProductViewDTO } from "../../dto/ProductViewDTO";
import type {
  CreateProductDTO,
  CreateProductValues,
} from "../../dto/ProductToCreateDTO";
import type { ProductManager } from "../domain/product/ProductManager";
import { generateId } from "../../utils/utils";
import { globalEventBus } from "../shared/EventBus";
import { type ProductReserve } from "../../dto/ProductReserve";
import { ProductToProduce } from "../domain/productToProduce/ProductToProduce";

export class ProductService {
  constructor(
    private productRepository: ProductRepository,
    private productManager: ProductManager,
  ) {
    this.productRepository = productRepository;
    this.productManager = productManager;
  }

  public async getAllModifiers(categoryName?: ProductCategory) {
    const mods = await this.productRepository.getAllModifiers(categoryName);

    return mods.map((i) => i.showFullData());
  }

  public async getModifier(id: string) {
    return this.productRepository.getModifier(id);
  }
  public async getModifierToView(id: string) {
    return (await this.getModifier(id)).showFullData();
  }

  public async saveModifier(data: Omit<ProductModifierProps, "id">) {
    const modifier = new ProductModifier(
      generateId(),
      data.name,
      data.categories,
      data.list,
    );

    const id = await this.productRepository.saveModifier(modifier);

    return await this.getModifierToView(id);
  }

  public async deleteModifier(id: string) {
    const productsId = await this.productRepository.getProductsByModifier(id);
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

  public async createProduct(values: CreateProductValues) {
    const product = this.productManager.createByCategory(values.categoryName, {
      id: generateId(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
      categoryName: values.categoryName,
      name: values.fields.name?.trim() || "",
      quantity: Number(values.fields.quantity),
      price: Number(values.fields.price),
      width: Number(values.fields.width),
      thickness: Number(values.fields.thickness),
      length: Number(values.fields.length),
    });

    const id = await this.productRepository.save(product);

    return await this.getProductToView(id);
  }

  public async updateProduct(productId: string, values: CreateProductDTO) {
    const product = await this.productRepository.getById(productId);

    product.name = values.fields.name;
    product.quantity = values.fields.quantity;
    product.price = values.fields.price;

    const id = await this.productRepository.update(product);

    const events = product.pullDomainEvents();

    for (const event of events) {
      await globalEventBus.publish(event.eventName, event.payload);
    }

    return await this.getProductToView(id);
  }

  public async getAll() {
    const products = await this.productRepository.getAll();

    return products.map((i) => i.toView());
  }

  public async delete(id: string): Promise<string> {
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

  public async getProductById(productId: string) {
    return await this.productRepository.getById(productId);
  }

  public async getProductByIds(productIds: string[]) {
    return await this.productRepository.getByIds(productIds);
  }
  public async getProductByIdsToView(productIds: string[]) {
    const products = await this.getProductByIds(productIds);

    return products.map((i) => i.toView());
  }

  public async getProductByIdsMap(productIds: string[]) {
    const products = await this.productRepository.getByIds(productIds);

    return new Map(products.map((p) => [p.id, p]));
  }
  public async getProductByIdsToViewMap(productIds: string[]) {
    const products = await this.productRepository.getByIds(productIds);

    return new Map(products.map((p) => [p.id, p.toView()]));
  }

  public async getProductToView(productId: string) {
    const product = await this.getProductById(productId);

    return product.toView();
  }
  public async getProductProps(categoryName: ProductCategory) {
    return await this.productManager.getPropsToCreate(categoryName);
  }

  public async updateProductQuantity(
    productId: string,
    unitOperation: "add" | "subtract",
    quantity: number,
  ) {
    const product = await this.productRepository.getById(productId);

    if (unitOperation === "add") product.increaseQuantity(quantity);
    if (unitOperation === "subtract") product.decreaseQuantity(quantity);

    await this.productRepository.update(product);

    return product.toView();
  }

  public async getTotalAmount(id: string, quantity: number): Promise<number> {
    const product = await this.productRepository.getById(id);

    product.quantity = quantity;

    return product.totalAmount;
  }

  public async getByCategory(categoryName: ProductCategory) {
    return await this.productRepository.getProductsByCategory(categoryName);
  }

  public async writeOffStock(data: { productId: string; quantity: number }[]) {
    const ids = data.map((i) => i.productId);

    const products = await this.getProductByIdsMap(ids);

    try {
      data.map((i) => {
        const product = products.get(i.productId);

        if (product) {
          product.decreaseQuantity(i.quantity);
        }
      });
    } catch (error) {
      if (error instanceof AppError) {
        console.log(error.details);
      }

      throw new AppError("DOMAIN", "Недостатньо запасів на складі");
    }

    return await this.productRepository.updateBulk([...products.values()]);
  }

  public async addToReserve(data: { productId: string; quantity: number }[]) {
    return await this.productRepository.addToReserve(
      data.map((i) => ({ ...i, id: generateId() }) as ProductReserve),
    );
  }

  public async deleteFromReserve(id: string) {
    return await this.productRepository.deleteFromReserve(id);
  }

  public async createRequestToProduce(
    data: { productId: string; quantity: number }[],
  ) {
    const products = await this.getProductByIdsMap(
      data.map((i) => i.productId),
    );

    const productsToProduce = data.reduce((acc, i) => {
      const product = products.get(i.productId);
      const diff = i.quantity - (product?.quantity ?? 0);

      if (product && diff > 0) {
        acc.push(new ProductToProduce(generateId(), product.id, diff));
      }

      return acc;
    }, [] as ProductToProduce[]);

    return this.productRepository.addToProduce(productsToProduce);
  }

  public async deleteFromProduce(id: string) {
    return await this.productRepository.deleteFromProduce(id);
  }

  public async getProductsToProduce() {
    const productsToProduce = await this.productRepository.getAllToProduce();

    const productsToProduceMap = new Map(
      productsToProduce.map((i) => [i.productId, i]),
    );

    const products = await this.getProductByIds(
      productsToProduce.map((i) => i.productId),
    );

    return products.map((p) => {
      const productToProduce = productsToProduceMap.get(p.id);

      if (productToProduce) {
        p.quantity = productToProduce.quantity;

        return { ...p.toView(), id: productToProduce.id };
      }

      return p.toView();
    });
  }

  public async setProductAsProduced(id: string) {
    const productToProduce =
      await this.productRepository.getProductToProduce(id);

    productToProduce.setDone();

    await this.productRepository.setProductAsProduced(productToProduce);

    return productToProduce;
  }
}
