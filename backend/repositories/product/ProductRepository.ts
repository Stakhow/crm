import type { IProductRepository } from "./IProductRepository";
import { db } from "../../../config/db";
import { BaseProduct } from "../../domain/product/BaseProduct";
import { AppError } from "../../../utils/error";
import type { ProductDataDTO } from "../../../dto/ProductDataDTO";
import type { ProductCategory } from "../../domain/product/ProductCategory";
import type { ProductManager } from "../../domain/product/ProductManager";
import { ProductModifier } from "../../domain/product/modifiers/ProductModifier";

type ModDTO = {
  id: number;
  name: string;
  category: ProductCategory[];
};

type ModListDTO = {
  id: number;
  name: string;
  price: number;
  groupId: number;
};

export class ProductRepository implements IProductRepository {
  constructor(private productManager: ProductManager) {}

  async save(product: BaseProduct): Promise<number> {
    const data = {
      ...product.toPersistence(),
      createdAt: Date.now(),
    };

    const productId = await db.products.put(data);

    await db.product_modifiers_relations.bulkAdd(
      product.modifiersPersistence.map((i) => ({
        productId,
        groupId: i.id,
        itemId: i.itemId,
      })),
    );

    return productId;
  }

  async update(id: number, product: BaseProduct): Promise<number> {
    const data = {
      ...product.toPersistence(),
      updatedAt: Date.now(),
    };

    return await db.products.update(id, data);
  }

  async getById(id: number): Promise<BaseProduct> {
    const productDTO = await db.products.get(id);

    const modifiers = await this._getProductModifiers([productDTO.id]);

    const product = this.productManager.createByCategory(
      productDTO.categoryName,
      {
        ...productDTO,
        modifiers: modifiers.get(id),
      },
    );

    return product;
  }
  async getByIds(ids: number[]): Promise<BaseProduct[]> {
    const productsDTO = await db.products.bulkGet(ids);

    return this._getProducts(productsDTO);
  }

  private async _getProducts(
    productsDTO: ProductDataDTO[],
  ): Promise<BaseProduct[]> {
    const productIds = productsDTO.map((i) => i.id);
    const modifiers = await this._getProductModifiers(productIds);

    return productsDTO.map((dto) =>
      this.productManager.createByCategory(dto.categoryName, {
        ...dto,
        modifiers: modifiers.get(dto.id),
      }),
    );
  }

  async getAll(): Promise<BaseProduct[]> {
    const productsDTO: ProductDataDTO[] = await db.products.toArray();

    return this._getProducts(productsDTO);
  }

  async getByCategory(categoryName: ProductCategory): Promise<BaseProduct[]> {
    const productsDTO = await db.products.where({ categoryName }).toArray();
    return this._getProducts(productsDTO);
  }

  async getProductsByModifier(modifierId: number): Promise<number[]> {
    const productsRelationsWithMode = await db.product_modifiers_relations
      .where("groupId")
      .equals(modifierId)
      .toArray();
    return productsRelationsWithMode.map((i) => i.productId);
  }

  async deleteModifier(id: number): Promise<void> {
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

  async delete(id: number): Promise<void> {
    return await db.transaction(
      "rw",
      db.products,
      db.product_modifiers_relations,
      async () => {
        await db.product_modifiers_relations
          .where("productId")
          .equals(id)
          .delete();

        return await db.products.delete(id);
      },
    );
  }

  async saveModifier(mod: ProductModifier): Promise<number> {
    return await db.transaction(
      "rw",
      db.modifiers_groups,
      db.modifiers_values,
      async () => {
        const modId: number = await db.modifiers_groups.add({
          name: mod.name,
          category: mod.category,
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

  async updateModifier(mod: ProductModifier): Promise<number> {
    return await db.transaction(
      "rw",
      db.modifiers_groups,
      db.modifiers_values,
      async () => {
        await db.modifiers_groups.update(mod.id, {
          name: mod.name,
          category: mod.category,
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

  async getModifier(id: number): Promise<ProductModifier> {
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

  async getAllModifiers(): Promise<ProductModifier[]> {
    const modsDTO = await db.modifiers_groups.toArray();

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

  private async _getProductModifiers(
    productIds: number[],
  ): Promise<Map<number, ProductModifier[]>> {
    const relations = await db.product_modifiers_relations
      .where("productId")
      .anyOf(productIds)
      .toArray();

    const groupIds = new Set<number>();
    const valueIds = new Set<number>();

    for (const r of relations) {
      groupIds.add(r.groupId);
      valueIds.add(r.itemId);
    }

    const [groups, values] = await Promise.all([
      db.modifiers_groups
        .where("id")
        .anyOf([...groupIds])
        .toArray(),
      db.modifiers_values
        .where("groupId")
        .anyOf([...groupIds])
        .toArray(),
    ]);

    const modifiersMap = new Map<number, ProductModifier[]>();
    productIds.map((id) => {
      const r = relations
        .filter((i) => i.productId === id)
        .map((i) => {
          return {
            ...groups.find((g) => g.id === i.groupId),
            list: values.filter(
              (v) => v.groupId === i.groupId && v.id === i.itemId,
            ),
          };
        })
        .map((i) => new ProductModifier(i.id, i.name, i.category, i.list));

      modifiersMap.set(id, r);
      return r;
    });

    return modifiersMap;
  }
}
