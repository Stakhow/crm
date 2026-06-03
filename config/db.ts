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

    this.version(8).stores({
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
    });
  }
}

export const db = new DexieDb();