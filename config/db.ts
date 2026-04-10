import Dexie, { type Table } from "dexie";
import type { Optional } from "dexie";

import type { ProductCategory } from "../backend/domain/product/ProductCategory";
import type { ClientDTO } from "../dto/ClientDTO";
import type { OrderStatus } from "../backend/domain/order/Order";
import type { ProductViewDTO } from "../dto/ProductViewDTO";

export class DexieDb extends Dexie {
  products!: Table<any, number>;
  modifiers_groups!: Table<
    Optional<
      {
        id: number;
        category: ProductCategory[];
        name: string;
        createdAt: number;
        updatedAt?: number;
      },
      "id"
    >,
    number
  >;
  modifiers_values!: Table<
    Optional<
      {
        id: number;
        groupId: number;
        name: string;
        price: number;
      },
      "id"
    >,
    number
  >;
  product_modifiers_relations!: Table<
    { productId: number; itemId: number; groupId: number },
    number
  >;
  orders!: Table<
    Optional<
      {
        id: number;
        client: ClientDTO;
        clientId: number;
        totalAmount: number;
        quantity: number;
        status: OrderStatus;
        deadline: number;
        createdAt: number;
      },
      "id"
    >,
    number
  >;
  order_items!: Table<
    {
      orderId: number;
      productId: number;
      data: ProductViewDTO;
    },
    number
  >;
  logs!: Table<any, number>;
  clients!: Table<
    Optional<
      {
        id: number;
        name: string;
        phone: string;
        createdAt: number;
        updatedAt?: number;
      },
      "id"
    >,
    number
  >;
  cart!: Table<any, number>;
  cart_items!: Table<any, number>;

  constructor() {
    super("crm");
    this.version(4).stores({
      products:
        "++id, category, categoryId, categoryName, name, weight, length, thickness",
      modifiers_groups: "++id",
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

db.on("ready", async () => {
  // Add initial users
  // modifiers_groups
  // modifiers_values

  await db.products.toCollection().modify((row) => {
    const isoDate = row.createdAt;
    const isoDate2 = row.updatedAt;

    row.createdAt = new Date(isoDate).getTime();
    row.updatedAt = new Date(isoDate2).getTime();
  });
  await db.clients.toCollection().modify((row) => {
    const isoDate = row.createdAt;
    const isoDate2 = row.updatedAt;

    row.createdAt = new Date(isoDate).getTime();
    row.updatedAt = new Date(isoDate2).getTime();
  });

  if ((await db.modifiers_groups.count()) === 0) {
    const modIds: number[] = await db.modifiers_groups.bulkPut(
      [
        { name: "Матеріал", category: ["film", "bag"] },
        { name: "Колір", category: ["film", "bag"] },
        { name: "Тип плівки", category: ["film"] },
        { name: "Тип плівки пакету", category: ["bag"] },
        {
          name: "Матеріал Стрейчу",
          category: ["stretch"],
        },
        { name: "Тип пакету", category: ["bag"] },
        {
          name: "Матеріал Гранули",
          category: ["granule"],
        },
      ],
      { allKeys: true },
    );

    const modsList = [
      [
        { name: "Вторинна", price: 72 },
        { name: "Первинна", price: 110 },
      ],
      [
        { name: "Прозорий", price: 0 },
        { name: "Кольоровий", price: 2 },
      ],
      [
        { name: "Карман", price: 0 },
        { name: "Рукав", price: 0 },
        { name: "Напіврукав", price: 0 },
        { name: "Полотно", price: 0 },
      ],
      [
        { name: "Карман", price: 0 },
        { name: "Рукав", price: 0 },
      ],
      [
        { name: "Вторинна", price: 100 },
        { name: "Первинна", price: 200 },
        { name: "Первинна", price: 200 },
      ],
      [
        { name: "Пакет", price: 0 },
        { name: "Ручка", price: 0 },
        { name: "Майка", price: 0 },
      ],
      [
        { name: "Вторинна", price: 72 },
        { name: "Первинна", price: 110 },
      ],
    ];

    const modsListBulk = modIds.map((modId, idx) =>
      modsList[idx].map((i) => ({ ...i, groupId: modId })),
    );

    await db.modifiers_values.bulkPut(modsListBulk.flat());
  }

  // seed MOCK clients
  if ((await db.clients.count()) === 0) {
    const clients = [
      {
        id: 0,
        name: "Олександр Шевченко",
        phone: "+380501234567",
        createdAt: Date.now(),
      },
      {
        id: 0,
        name: "Олена Петренко",
        phone: "+380679876543",
        createdAt: Date.now(),
      },
      {
        id: 0,
        name: "Дмитро Бойко",
        phone: "+380935551234",
        createdAt: Date.now(),
      },
      {
        id: 0,
        name: "Тетяна Коваленко",
        phone: "+380664448899",
        createdAt: Date.now(),
      },
      {
        id: 0,
        name: "Андрій Бондаренко",
        phone: "+380682223344",
        createdAt: Date.now(),
      },
      {
        id: 0,
        name: "Марина Мельник",
        phone: "+380737770011",
        createdAt: Date.now(),
      },
      {
        id: 0,
        name: "Сергій Мороз",
        phone: "+380443210987",
        createdAt: Date.now(),
      },
    ];

    await db.clients.bulkPut(clients);
  }
});
