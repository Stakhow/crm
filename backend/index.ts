// app/container.ts

import { Factory } from './shared/factory/Factory';
import { ProductManager } from './domain/product/ProductManager';
import { OrderCalculator } from './domain/order/OrderCalculator';

import { IndexedDB } from './../config/db';
import { ClientRepository } from './repositories/client/ClientRepository';
// import { ProductRepository } from './repositories/product/ProductRepository';
import { OrderRepository } from './repositories/order/OrderRepository';

import { OrderService } from './services/OrderService';
import { ClientService } from './services/ClientService';

const factory = new Factory();


const db = new IndexedDB('crm-db', 1, {
  clients: { keyPath: 'id', autoIncrement: true },
  products: { keyPath: 'id', autoIncrement: true },
  orders: { keyPath: 'id', autoIncrement: true },
});


const productManager = new ProductManager(factory);
const orderCalculator = new OrderCalculator();


const clientRepository = new ClientRepository(db);
// const productRepository = new IndexedDBProductRepository(db);
// const orderRepository = new OrderRepository(db);


// export const createOrderUseCase = new OrderService(
//   productManager
//   orderCalculator,
//   orderRepository
// );

export const clientService = new ClientService(clientRepository);



// function dateToISOStringLocal(date) {
//     const offsetMs = date.getTimezoneOffset() * 60000; // Offset in milliseconds
//     const localDate = new Date(date.getTime() - offsetMs); // Adjust date to "pretend" it is local time in UTC context
//     // slice(0, -1) removes the "Z" (UTC) suffix
//     return localDate.toISOString(); 
// }