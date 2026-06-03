import { ProductFactory } from "./shared/factory/ProductFactory";
import { ProductManager } from "./domain/product/ProductManager";

import { ClientRepository } from "./repositories/ClientRepository";
import { ProductRepository } from "./repositories/ProductRepository";
import { OrderRepository } from "./repositories/OrderRepository";
import { ProductionRepository } from "./repositories/ProductionRepository";

import { ClientService } from "./services/ClientService";
import { ProductService } from "./services/ProductService";
import { OrderService } from "./services/OrderService";
import { CartService } from "./services/CartService";
import { CartRepository } from "./repositories/CartRepository";
import { ProductSubscriber } from "./subscribers/ProductSubscriber";
import { CheckoutService } from "./services/CheckoutService";
import { OrderSubscriber } from "./subscribers/OrderSubscriber";
import { ProductionService } from "./services/ProductionService";

const productFactory = new ProductFactory();

const productManager = new ProductManager(productFactory);

const clientRepository = new ClientRepository();
const productRepository = new ProductRepository(productManager);
const orderRepository = new OrderRepository();
const cartRepository = new CartRepository();
const productToProduceRepository = new ProductionRepository();

export const clientService = new ClientService(clientRepository);

export const productService = new ProductService(
  productRepository,
  productManager,
);

export const cartService = new CartService(cartRepository, productService);

const checkoutService = new CheckoutService(orderRepository, cartService);

export const productionService = new ProductionService(
  productService,
  productToProduceRepository,
);

export const orderService = new OrderService(
  orderRepository,
  cartService,
  productService,
  clientService,
  checkoutService,
  productionService,
);

const productSubscriber = new ProductSubscriber();
// productService
productSubscriber.init();

const orderSubscriber = new OrderSubscriber();
// productService
orderSubscriber.init();
