import { Optional } from "dexie";
import type { ProductCategory } from "../backend/domain/product/ProductCategory";
import type { ClientDTO } from "../dto/ClientDTO";
import type { OrderStatus } from "../backend/domain/order/Order";
import type { ProductViewDTO } from "../dto/ProductViewDTO";

// ---------- PRODUCTS ----------
export type ProductDB = {
  id: number;
  name: string;
  createdAt: number;
  category: {
    id: number;
    name: ProductCategory;
    title: string;
  };
  categoryName: ProductCategory;
  price: number;
  totalAmount: number;
  weight: number;
  width?: number | undefined;
  thickness?: number | undefined;
  length?: number | undefined;
  quantity?: number | undefined;
};

// ---------- MODIFIERS ----------
export type ModifierGroupDB = Optional<
  {
    id: number;
    category: ProductCategory[];
    name: string;
    createdAt: number;
    updatedAt?: number;
  },
  "id"
>;

export type ModifierValueDB = Optional<
  {
    id: number;
    groupId: number;
    name: string;
    price: number;
  },
  "id"
>;

export type ProductModifierRelationDB = {
  productId: number;
  itemId: number;
  groupId: number;
};

// ---------- ORDERS ----------
export type OrderDB = Optional<
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
>;

export type OrderItemDB = Optional<
  {
    id: number;
    orderId: number;
    productId: number;
    data: ProductViewDTO;
  },
  "id"
>;

// ---------- CLIENTS ----------
export type ClientDB = Optional<
  {
    id: number;
    name: string;
    phone: string;
    createdAt: number;
    updatedAt?: number;
  },
  "id"
>;

// ---------- OTHER ----------
export type LogDB = {
  id?: number;
  type: string;
  timestamp: number;
};

export type CartDB = any;
export type CartItemDB = any;
