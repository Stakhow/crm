// app/container.ts

import { Factory } from "./shared/factory/Factory";
import { ProductManager } from "./domain/product/ProductManager";
import { OrderCalculator } from "./domain/order/OrderCalculator";

import { ClientRepository } from "./repositories/client/ClientRepository";
import { ProductRepository } from "./repositories/product/ProductRepository";
import { OrderRepository } from "./repositories/order/OrderRepository";

import { OrderService } from "./services/OrderService";
import { ClientService } from "./services/ClientService";
import { ProductService } from "./services/ProductService";

const factory = new Factory();

// export interface StoreIndex {
//   name: string;
//   keyPath: string | string[];
//   options?: IDBIndexParameters;
// }

// export interface StoreSchema {
//   name: string;
//   options: IDBObjectStoreParameters;
//   indexes?: StoreIndex[];
// }

// export interface DBSchema {
//   name: string;
//   version: number;
//   stores: StoreSchema[];
// }
// export const appDBSchema: DBSchema = {
//   name: "crm",
//   version: 3,
//   stores: [
//     {
//       name: "clients",
//       options: { keyPath: "id", autoIncrement: true },
//       indexes: [{ name: "phone", keyPath: "phone", options: { unique: true } }],
//     },
//     {
//       name: "products",
//       options: { keyPath: "id", autoIncrement: true },
//       indexes: [
//         { name: "category", keyPath: "category" },
//         { name: "price", keyPath: "price" },
//         { name: "weigth", keyPath: "weigth" },
//         { name: "width", keyPath: "width" },
//         { name: "thickness", keyPath: "thickness" },
//         { name: "createdAt", keyPath: "createdAt" },
//         { name: "quantity", keyPath: "quantity" },
//         { name: "name", keyPath: "name" },
//         { name: "subproduct", keyPath: ['category', 'width', 'thickness']}
//       ],
//     },
//     {
//       name: "orders",
//       options: { keyPath: "id", autoIncrement: true },
//       indexes: [
//         { name: "userId", keyPath: "userId" },
//         { name: "createdAt", keyPath: "createdAt" },
//       ],
//     },
//   ],
// };

// const db = new IndexedDB(appDBSchema);

const productManager = new ProductManager(factory);
const orderCalculator = new OrderCalculator();

const clientRepository = new ClientRepository();
const productRepository = new ProductRepository();
const orderRepository = new OrderRepository();

export const orderService = new OrderService(
  productManager,
  orderCalculator,
  orderRepository,
);

export const clientService = new ClientService(clientRepository);

export const productService = new ProductService(
  productManager,
  productRepository,
);

// function dateToISOStringLocal(date) {
//     const offsetMs = date.getTimezoneOffset() * 60000; // Offset in milliseconds
//     const localDate = new Date(date.getTime() - offsetMs); // Adjust date to "pretend" it is local time in UTC context
//     // slice(0, -1) removes the "Z" (UTC) suffix
//     return localDate.toISOString();
// }
