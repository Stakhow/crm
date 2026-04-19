// app/container.ts

import { ProductFactory } from "./shared/factory/ProductFactory";
import { ProductManager } from "./domain/product/ProductManager";

import { ClientRepository } from "./repositories/client/ClientRepository";
import { ProductRepository } from "./repositories/product/ProductRepository";
import { OrderRepository } from "./repositories/order/OrderRepository";

import { ClientService } from "./services/ClientService";
import { ProductService } from "./services/ProductService";
import { OrderService } from "./services/OrderService";
import { CartService } from "./services/CartService";
import { CartRepository } from "./repositories/cart/CartRepository";

const productFactory = new ProductFactory();

const productManager = new ProductManager(productFactory);

const clientRepository = new ClientRepository();
const productRepository = new ProductRepository(productManager);
const orderRepository = new OrderRepository();
const cartRepository = new CartRepository();

export const clientService = new ClientService(clientRepository);

export const productService = new ProductService(productRepository);

export const cartService = new CartService(cartRepository, productService);

export const orderService = new OrderService(
  orderRepository,
  cartService,
  productService,
  clientService,
);
