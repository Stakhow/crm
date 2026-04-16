import Dexie, { type Table } from "dexie";

import type {
  ProductDB,
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
  products!: Table<ProductDB, number>;
  modifiers_groups!: Table<ModifierGroupDB, number>;
  modifiers_values!: Table<ModifierValueDB, number>;
  product_modifiers_relations!: Table<ProductModifierRelationDB, number>;
  orders!: Table<OrderDB, number>;
  order_items!: Table<OrderItemDB, number>;
  logs!: Table<LogDB, number>;
  clients!: Table<ClientDB, number>;
  cart!: Table<CartDB, number>;
  cart_items!: Table<CartItemDB, number>;

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
  }
}

export const db = new DexieDb();

// db.on("ready", async () => {
//   // Add initial users
//   // modifiers_groups
//   // modifiers_values
//   if ((await db.modifiers_groups.count()) === 0) {
//     const modIds: number[] = await db.modifiers_groups.bulkPut(
//       [
//         { name: "Матеріал", category: ["film", "bag"] },
//         { name: "Колір", category: ["film", "bag"] },
//         { name: "Тип плівки", category: ["film"] },
//         { name: "Тип плівки пакету", category: ["bag"] },
//         {
//           name: "Матеріал Стрейчу",
//           category: ["stretch"],
//         },
//         { name: "Тип пакету", category: ["bag"] },
//         {
//           name: "Матеріал Гранули",
//           category: ["granule"],
//         },
//       ],
//       { allKeys: true },
//     );

//     const modsList = [
//       [
//         { name: "Вторинна", price: 72 },
//         { name: "Первинна", price: 110 },
//       ],
//       [
//         { name: "Прозорий", price: 0 },
//         { name: "Кольоровий", price: 2 },
//       ],
//       [
//         { name: "Карман", price: 0 },
//         { name: "Рукав", price: 0 },
//         { name: "Напіврукав", price: 0 },
//         { name: "Полотно", price: 0 },
//       ],
//       [
//         { name: "Карман", price: 0 },
//         { name: "Рукав", price: 0 },
//       ],
//       [
//         { name: "Вторинна", price: 100 },
//         { name: "Первинна", price: 200 },
//         { name: "Первинна", price: 200 },
//       ],
//       [
//         { name: "Пакет", price: 0 },
//         { name: "Ручка", price: 0 },
//         { name: "Майка", price: 0 },
//       ],
//       [
//         { name: "Вторинна", price: 72 },
//         { name: "Первинна", price: 110 },
//       ],
//     ];

//     const modsListBulk = modIds.map((modId, idx) =>
//       modsList[idx].map((i) => ({ ...i, groupId: modId })),
//     );

//     await db.modifiers_values.bulkPut(modsListBulk.flat());
//   }

//   // seed MOCK clients
//   // if ((await db.clients.count()) === 0) {
//   //   const clients = [
//   //     {
//   //       // id: 0,
//   //       name: "Олександр Шевченко",
//   //       phone: "+380501234567",
//   //       createdAt: Date.now(),
//   //     },
//   //     {
//   //       // id: 0,
//   //       name: "Олена Петренко",
//   //       phone: "+380679876543",
//   //       createdAt: Date.now(),
//   //     },
//   //     {
//   //       // id: 0,
//   //       name: "Дмитро Бойко",
//   //       phone: "+380935551234",
//   //       createdAt: Date.now(),
//   //     },
//   //     {
//   //       // id: 0,
//   //       name: "Тетяна Коваленко",
//   //       phone: "+380664448899",
//   //       createdAt: Date.now(),
//   //     },
//   //     {
//   //       // id: 0,
//   //       name: "Андрій Бондаренко",
//   //       phone: "+380682223344",
//   //       createdAt: Date.now(),
//   //     },
//   //     {
//   //       // id: 0,
//   //       name: "Марина Мельник",
//   //       phone: "+380737770011",
//   //       createdAt: Date.now(),
//   //     },
//   //     {
//   //       // id: 0,
//   //       name: "Сергій Мороз",
//   //       phone: "+380443210987",
//   //       createdAt: Date.now(),
//   //     },
//   //   ];

//   //   await db.clients.bulkPut(clients);
//   // }
// });
