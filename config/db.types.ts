// @ts-ignore
import { Optional } from "dexie";

import type { ProductCategory } from "../backend/domain/product/ProductCategory";
import type { OrderStatus } from "../backend/domain/order/Order";
import type { ProductDataDTO } from "../dto/ProductDataDTO";
import { OrderItem } from "../backend/domain/order/OrderItem";
import { type IProductProduce } from "../dto/ProductProduce";
import { type ProductReserve } from "../dto/ProductReserve";

// ---------- PRODUCTS ----------
export type ProductDB = ProductDataDTO;

export type ProductReserveDB = ProductReserve;

export type ProductToProduceDB = IProductProduce;

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
export type OrderDB = {
  id: string;
  clientId: string;
  clientName: string;
  clientPhone: string;
  totalAmount: number;
  quantity: number;
  status: OrderStatus;
  deadline: number;
  createdAt: number;
  amountPaid: number;
};

export type OrderItemDB = {
  id: string;
  orderId: string;
  productId: string;
  data: OrderItem;
};

// ---------- CLIENTS ----------
export type ClientDB = {
  id: string;
  name: string;
  phone: string;
  createdAt: number;
  updatedAt: number;
};

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
