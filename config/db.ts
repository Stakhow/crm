import Dexie, { type Table } from "dexie";

import type {
  ProductDB,
  ProductReserveDB,
  ProductToProduceDB,
  ModifierGroupDB,
  ModifierValueDB,
  ProductModifierRelationDB,
  OrderDB,
  OrderItemDB,
  ClientDB,
  LogDB,
  CartDB,
  CartItemDB,
} from "./db.types";

export class DexieDb extends Dexie {
  products!: Table<ProductDB, string>;
  products_reserve!: Table<ProductReserveDB, string>;
  products_to_produce!: Table<ProductToProduceDB, string>;
  modifiers_groups!: Table<ModifierGroupDB, string>;
  modifiers_values!: Table<ModifierValueDB, string>;
  product_modifiers_relations!: Table<ProductModifierRelationDB, string>;
  orders!: Table<OrderDB, string>;
  order_items!: Table<OrderItemDB, string>;
  logs!: Table<LogDB, string>;
  clients!: Table<ClientDB, string>;
  cart!: Table<CartDB, string>;
  cart_items!: Table<CartItemDB, string>;

  constructor() {
    super("crm");

    this.version(1).stores({
      products:
        "++id, category, categoryId, categoryName, name, weight, length, thickness",
      modifiers_groups: "++id, *category",
      modifiers_values: "++id, groupId",
      product_modifiers_relations: "++id, productId, groupId",
      orders: "++id, clientId, createdAt, deadline",
      order_items: "++id, orderId, productId",
      logs: "++id, type, timestamp",
      clients: "++id, name, phone",
      cart: "id, clientId, createdAt",
      cart_items: "++id, cartId, productId, [productId+cartId]",
    });

    this.version(8)
      .stores({
        products:
          "id, category, categoryId, categoryName, name, weight, length, thickness",
        products_reserve: "id, productId, orderId",
        products_to_produce: "id, productId, orderId",
        modifiers_groups: "id, *category",
        modifiers_values: "id, groupId",
        product_modifiers_relations: "id, productId, groupId",
        orders: "id, clientId, createdAt, deadline",
        order_items: "id, orderId, productId",
        logs: "id, type, timestamp",
        clients: "id, name, phone",
        cart: "id, clientId, createdAt",
        cart_items: "id, cartId, productId",
      })
      .upgrade(async (tx) => {
        const oldTables = [
          "products",
          "modifiers_groups",
          "modifiers_values",
          "product_modifiers_relations",
          "orders",
          "order_items",
          "logs",
          "clients",
          "cart",
          "cart_items",
        ];

        const backupObj: Record<string, any[]> = {};

        for (const tableName of oldTables) {
          try {
            const data = await tx.table(tableName).toArray();
            backupObj[tableName] = data;
          } catch (e) {
            console.warn(`Не вдалося зчитати дані з таблиці ${tableName}:`, e);
          }
        }

        localStorage.setItem(
          "crm_v1_prod_backup",
          JSON.stringify(backupObj, null, 2),
        );

        for (const tableName of oldTables) {
          try {
            await tx.table(tableName).clear();
          } catch (e) {
            console.error(`Помилка очищення таблиці ${tableName}:`, e);
          }
        }
      });
  }
}

export const db = new DexieDb();

db.open()
  .then(() => {
    const rawBackup = localStorage.getItem("crm_v1_prod_backup");

    if (rawBackup) {
      const blob = new Blob([rawBackup], { type: "application/json" });
      const url = URL.createObjectURL(blob);

      const downloadLink = document.createElement("a");
      downloadLink.href = url;
      downloadLink.download = `crm_site_backup_v1_${new Date().toISOString().slice(0, 10)}.json`;

      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);

      URL.revokeObjectURL(url);
      localStorage.removeItem("crm_v1_prod_backup");
      console.log("Стару базу успішно скачано у файл, схему оновлено до v8.");
    }
  })
  .catch((err) => {
    console.error(
      "Критична помилка ініціалізації або міграції бази даних crm:",
      err,
    );
  });
