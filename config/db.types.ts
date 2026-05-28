// @ts-ignore
import { Optional } from "dexie";

import type { ProductCategory } from "../backend/domain/product/ProductCategory";
import type { OrderStatus } from "../backend/domain/order/Order";
import type { ProductViewUIDTO } from "../dto/ProductViewDTO";
import type { ProductDataDTO } from "../dto/ProductDataDTO";
import type { ClientViewDTO } from "../dto/ClientViewDTO";

// ---------- PRODUCTS ----------
export type ProductDB = ProductDataDTO;

// ---------- MODIFIERS ----------
export type ModifierGroupDB = Optional<
  {
    id: string;
    category: ProductCategory[];
    name: string;
    createdAt: number;
    updatedAt?: number;
  },
  "id"
>;

export type ModifierValueDB = Optional<
  {
    id: string;
    groupId: string;
    name: string;
    price: number;
  },
  "id"
>;

export type ProductModifierRelationDB = {
  productId: string;
  itemId: string;
  groupId: string;
};

// ---------- ORDERS ----------
export type OrderDB = Optional<
  {
    id: string;
    client: ClientViewDTO;
    totalAmount: number;
    quantity: number;
    status: OrderStatus;
    deadline: number;
    createdAt: number;
    amountPaid: number;
  },
  "id"
>;

export type OrderItemDB = Optional<
  {
    id: string;
    orderId: string;
    productId: string;
    data: ProductViewUIDTO;
  },
  "id"
>;

// ---------- CLIENTS ----------
export type ClientDB = Optional<
  {
    id: string;
    name: string;
    phone: string;
    createdAt: number;
    updatedAt: number;
  },
  "id"
>;

// ---------- CART ----------
export type CartDB = {
  id: string;
  createdAt: number;
};
export type CartItemDB = {
  id: string;
  productId: string;
  quantity: number;
  cartId: string;
};

// ---------- OTHER ----------
export type LogDB = {
  id?: string;
  type: string;
  timestamp: number;
};
