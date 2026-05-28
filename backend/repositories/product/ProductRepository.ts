import type { IProductRepository } from "./IProductRepository";
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
    // const { appliedModifiers } = product;

    return await db.transaction(
      "rw",
      db.products,
      // db.product_modifiers_relations,
      async () => {
        // await db.product_modifiers_relations
        //   .where("productId")
        //   .equals(product.id)
        //   .modify((row) => {
        //     row.itemId = appliedModifiers[row.groupId];
        //   });

        await db.products.update(product.id, {
          ...persistedProduct,
          updatedAt: Date.now(),
        });

        return product.id;
      },
    );
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
      db.product_modifiers_relations,
      async () => {
        await db.product_modifiers_relations
          .where("productId")
          .equals(id)
          .delete();

        await db.products.delete(id);

        return id;
      },
    );
  }

  async decreaseStock(mapItems: Map<string, number>) {
    const products = await this.getByIds([...mapItems.keys()]);

    try {
      products.forEach((p) => {
        const quantityToDecrease = mapItems.get(p.id) || 0;
        
        p.decreaseQuantity(quantityToDecrease);
      });
    } catch (error) {
      
      // throw new AppError("DOMAIN", `Недостатньо запасів продуктів: ${p.name}`);
    }
  }

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
