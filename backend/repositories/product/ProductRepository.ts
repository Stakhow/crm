import type { IProductRepository } from "../../domain/product/IProductRepository";
import { db } from "../../../config/db";
import {
  BaseProduct,
  type BaseProductProps,
} from "../../domain/product/BaseProduct";
import { AppError } from "../../../utils/error";
import type { ProductDataDTO } from "../../../dto/ProductDataDTO";
import {
  Category,
  type ProductCategory,
} from "../../domain/product/ProductCategory";
import type { ProductManager } from "../../domain/product/ProductManager";
import { ProductModifier } from "../../domain/product/modifiers/ProductModifier";
import type { ProductByCategory } from "../../domain/product/ProductByCategory";
import type { ProductReserve } from "../../../dto/ProductReserve";
import { ProductToProduce } from "../../domain/productToProduce/ProductToProduce";
import { globalEventBus } from "../../shared/EventBus";

type ModListDTO = {
  id: string;
  name: string;
  price: string;
  groupId: string;
};

export class ProductRepository implements IProductRepository {
  constructor(private productManager: ProductManager) {}

  async save(product: BaseProduct<ProductCategory>) {
    const productId = await db.products.put(product.toPersistence());

    return productId;
  }

  public async getCategories() {
    return new Category().getAll();
  }

  async update(product: BaseProduct<ProductCategory>): Promise<string> {
    const persistedProduct = product.toPersistence();

    return await db.transaction(
      "rw",
      db.products,

      async () => {
        await db.products.update(product.id, persistedProduct);

        return product.id;
      },
    );
  }

  async updateBulk(
    products: BaseProduct<ProductCategory>[],
  ): Promise<string[]> {
    const productsPersisted = products.map((i) => i.toPersistence());

    return await db.products.bulkPut(productsPersisted, { allKeys: true });
  }

  private _createProduct(
    props: BaseProductProps,
  ): InstanceType<(typeof ProductByCategory)[ProductCategory]> {
    const product = this.productManager.createByCategory(
      props.categoryName,
      props,
    );

    return product;
  }

  public async getById(id: string): Promise<BaseProduct<ProductCategory>> {
    const productDTO = await db.products.get(id);

    if (!productDTO) throw new AppError("SERVICE", "Продукту не існує");

    return await this._createProduct(productDTO);
  }

  async getByIds(ids: string[]) {
    const productsDTO = await db.products.bulkGet(ids);

    return this._getProducts(productsDTO.filter((i) => !!i));
  }

  private _getProducts(productsDTO: ProductDataDTO[]) {
    return productsDTO.map((dto) => this._createProduct(dto));
  }

  async getAll(): Promise<BaseProduct<ProductCategory>[]> {
    const productsDTO: ProductDataDTO[] = await db.products.reverse().toArray();

    return await this._getProducts(productsDTO);
  }

  async getProductsByCategory(
    categoryName: ProductCategory,
  ): Promise<BaseProduct<ProductCategory>[]> {
    const productsDTO = await db.products
      .where({ categoryName })
      .reverse()
      .toArray();
    return await this._getProducts(productsDTO);
  }

  async delete(id: string): Promise<string> {
    return await db.transaction(
      "rw",
      db.products,
      // db.product_modifiers_relations,
      async () => {
        // await db.product_modifiers_relations
        //   .where("productId")
        //   .equals(id)
        //   .delete();

        await db.products.delete(id);

        return id;
      },
    );
  }

  // ========= RESERVE ==========
  async getReserved(): Promise<ProductReserve[]> {
    const reserved = await db.products_reserve.toArray();

    return reserved;
  }
  async addToReserve(
    data: { id: string; productId: string; quantity: number }[],
  ): Promise<string[]> {
    return await db.products_reserve.bulkPut(data, { allKeys: true });
  }

  async deleteFromReserve(id: string): Promise<string> {
    await db.products_reserve.delete(id);

    return id;
  }
  // ========= /RESERVE ==========

  // ========= TO PRODUCE ==========
  async addToProduce(productsToProduce: ProductToProduce[]): Promise<string[]> {
    const productEntities = productsToProduce.map((i) => i.toDB());
    return await db.products_to_produce.bulkPut(productEntities, {
      allKeys: true,
    });
  }
  async deleteFromProduce(
    productToProductId: string | string[],
  ): Promise<string | string[]> {
    const ids = Array.isArray(productToProductId)
      ? productToProductId
      : [productToProductId];

    await db.products_to_produce.where("id").anyOf(ids).delete();

    return productToProductId;
  }
  async getAllToProduce(): Promise<ProductToProduce[]> {
    const productEntities = await db.products_to_produce.toArray();

    return productEntities.map(
      (i) =>
        new ProductToProduce(
          i.id,
          i.productId,
          i.quantity,
          i.orderId,
          i.status,
        ),
    );
  }

  async getToProduceByOrder(orderId: string): Promise<ProductToProduce[]> {
    const productEntities = await db.products_to_produce
      .where({ orderId })
      .toArray();

    return productEntities.map(
      (i) =>
        new ProductToProduce(
          i.id,
          i.productId,
          i.quantity,
          i.orderId,
          i.status,
        ),
    );
  }

  async getProductToProduce(
    produceProductId: string,
  ): Promise<ProductToProduce> {
    const productEntity = await db.products_to_produce.get(produceProductId);
    if (!productEntity)
      throw new AppError("DOMAIN", "Не знайдено продукт для виготовлення");

    return new ProductToProduce(
      productEntity.id,
      productEntity.productId,
      productEntity.quantity,
      productEntity.orderId,
      productEntity.status,
    );
  }

  async setProductAsProduced(
    productToProduce: ProductToProduce,
  ): Promise<string> {
    await db.products_to_produce.update(productToProduce.id, productToProduce);
    globalEventBus.publishFromAggregate(productToProduce);

    return productToProduce.id;
  }
  // ========= /TO PRODUCE ==========

  // ========= MODIFIERS ==========

  async getProductsByModifier(modifierId: string): Promise<string[]> {
    const productsRelationsWithMode = await db.product_modifiers_relations
      .where("groupId")
      .equals(modifierId)
      .toArray();
    return productsRelationsWithMode.map((i) => i.productId);
  }

  async deleteModifier(id: string): Promise<void> {
    return await db.transaction(
      "rw",
      db.modifiers_groups,
      db.modifiers_values,
      async () => {
        await db.modifiers_values.where("groupId").equals(id).delete();
        await db.modifiers_groups.delete(id);
      },
    );
  }
  async saveModifier(mod: ProductModifier): Promise<string> {
    return await db.transaction(
      "rw",
      db.modifiers_groups,
      db.modifiers_values,
      async () => {
        const modId = await db.modifiers_groups.add({
          name: mod.name,
          category: mod.categories,
          createdAt: Date.now(),
        });

        const modsListBulk = mod.list.map((i) => ({
          name: i.name,
          price: i.price,
          groupId: modId,
        }));

        await db.modifiers_values.bulkAdd(modsListBulk);

        return modId;
      },
    );
  }

  async updateModifier(mod: ProductModifier): Promise<string> {
    return await db.transaction(
      "rw",
      db.modifiers_groups,
      db.modifiers_values,
      async () => {
        await db.modifiers_groups.update(mod.id, {
          name: mod.name,
          category: mod.categories,
          updatedAt: Date.now(),
        });

        const modsListBulk = mod.list.map((i) => ({
          id: i.id,
          name: i.name,
          price: i.price,
          groupId: mod.id,
        }));

        await db.modifiers_values.bulkPut(modsListBulk);

        return mod.id;
      },
    );
  }

  async getModifier(id: string): Promise<ProductModifier> {
    const modDTO = await db.modifiers_groups.get(id);

    const listDTO = await db.modifiers_values
      .where("groupId")
      .equals(id)
      .toArray();

    return new ProductModifier(
      modDTO.id,
      modDTO.name,
      modDTO.category,
      listDTO,
    );
  }

  async getAllModifiers(
    categoryName?: ProductCategory,
  ): Promise<ProductModifier[]> {
    const modsDTO = categoryName
      ? await db.modifiers_groups
          .where("category")
          .equals(categoryName)
          .toArray()
      : await db.modifiers_groups.toArray();

    const list: ModListDTO[] = await db.modifiers_values
      .where("groupId")
      .anyOf(modsDTO.map((i) => i.id))
      .toArray();

    const modsDTOFull = modsDTO.map((i) => ({
      ...i,
      list: list
        .filter((item) => item.groupId === i.id)
        .map((i) => ({
          id: i.id,
          name: i.name,
          price: i.price,
        })),
    }));

    const mods = modsDTOFull.map(
      (i) => new ProductModifier(i.id, i.name, i.category, i.list),
    );

    return mods;
  }

  // private async _getProductsModifiersRelations(productsId: string[]) {
  //   const relations = await db.product_modifiers_relations
  //     .where("productId")
  //     .anyOf(productsId)
  //     .toArray();

  //   const relationMap = relations.reduce((acc, current) => {
  //     const row = acc.get(current.productId);
  //     if (row) row[current.groupId] = current.itemId;
  //     else
  //       acc.set(current.productId, {
  //         [current.groupId]: current.itemId,
  //       });

  //     return acc;
  //   }, new Map<string, Record<string, string>>());

  //   return relationMap;
  // }

  // private async _getProductModifiers(
  //   productIds: string[],
  // ): Promise<Map<string, ProductModifier[]>> {
  //   const relations = await db.product_modifiers_relations
  //     .where("productId")
  //     .anyOf(productIds)
  //     .toArray();

  //   const groupIds = new Set<string>();
  //   const valueIds = new Set<string>();

  //   for (const r of relations) {
  //     groupIds.add(r.groupId);
  //     valueIds.add(r.itemId);
  //   }

  //   const [groups, values] = await Promise.all([
  //     db.modifiers_groups
  //       .where("id")
  //       .anyOf([...groupIds])
  //       .toArray(),
  //     db.modifiers_values
  //       .where("groupId")
  //       .anyOf([...groupIds])
  //       .toArray(),
  //   ]);

  //   const modifiersMap = new Map<string, ProductModifier[]>();

  //   productIds.map((id) => {
  //     const r = relations
  //       .filter((i) => i.productId === id)
  //       .map((i) => {
  //         return {
  //           ...groups.find((g) => g.id === i.groupId),
  //           list: values.filter((v) => v.groupId === i.groupId),
  //         };
  //       })
  //       .map((i) => new ProductModifier(i.id, i.name, i.category, i.list));

  //     modifiersMap.set(id, r);
  //     return r;
  //   });

  //   return modifiersMap;
  // }
}
