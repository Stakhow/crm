import { AppError } from "../../utils/error";
import { CartRepository } from "../repositories/CartRepository";
import type { ProductService } from "./ProductService";
import type { CartDTO } from "../../dto/CartDTO";
import { generateId } from "../../utils/utils";
import { Cart } from "../domain/cart/Cart";

export type CartItemAdd = {
  cartId: string;
  productId: string;
  quantity: number;
};

export class CartService {
  constructor(
    private cartReposirory: CartRepository,
    private productService: ProductService,
  ) {}

  async getCart(id?: string) {
    if (!id) return new Cart(generateId(), [], Date.now());

    return await this.cartReposirory.load(id);
  }

  async getCartToView(cartId: string): Promise<CartDTO> {
    const cart = await this.getCart(cartId);
    const products = await this.productService.getProductByIds(
      cart.getProductsId(),
    );

    const totalAmount = products.reduce((acc, product) => {
      const cartItem = cart.getItem(product.id);
      if (cartItem) {
        product.quantity = cartItem.quantity;

        acc += Number(product.totalAmount);
      }

      return acc;
    }, 0);

    const items = products.map((product) => {
      const cartItem = cart.getItem(product.id);
      if (!cartItem) throw new AppError("DOMAIN", "Позиція відсутня!");

      product.quantity = cartItem.quantity;

      return {
        ...cartItem.toPersistence(),
        name: product.name,
        price: product.price,
        total: product.totalAmount,
      };
    });

    const cartDTO = {
      ...cart.toPersistent(),
      items,
      productsIds: cart.getProductsId(),
      totalAmount,
    };

    return cartDTO;
  }

  async addCartItem(data: CartItemAdd): Promise<CartDTO> {
    const cart = await this.getCart(data.cartId);

    cart.addItem({
      productId: data.productId,
      quantity: data.quantity,
    });

    await this.cartReposirory.save(cart);

    return this.getCartToView(cart.id);
  }

  async deleteCartItem(cartId: string, productId: string): Promise<CartDTO> {
    const cart = await this.getCart(cartId);
    cart.removeItem(productId);

    await this.cartReposirory.save(cart);

    return this.getCartToView(cartId);
  }

  async deleteCart(cartId: string) {
    return await this.cartReposirory.delete(cartId);
  }

  async createFromOrder(cartItems: CartItemAdd[]) {
    const cart = await this.getCart();

    cartItems.map((i) => cart.addItem(i));

    await this.cartReposirory.save(cart);

    return this.getCartToView(cart.id);
  }
}
