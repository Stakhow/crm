import { AppError } from "../../utils/error";
import { CartRepository } from "../repositories/cart/CartRepository";
import type { ProductService } from "./ProductService";
import type { CartDTO } from "../../dto/CartDTO";

export class CartService {
  constructor(
    private cartReposirory: CartRepository,
    private productService: ProductService,
  ) {}

  async getCart() {
    return await this.cartReposirory.load();
  }

  async createFromOrder(
    cartItems: {
      productId: number;
      quantity: number;
      clientId: number;
    }[],
  ) {
    await this.resetCart();

    const products = await this.productService.getProductByIds(
      cartItems.map((i) => i.productId),
    );

    const notAvailableProducts = products.filter((i) => !i.isAvailable());

    if (notAvailableProducts.length > 0) {
      const producNames = notAvailableProducts.map((i) => i.name).join("|");

      throw new AppError("DOMAIN", `не доступні ${producNames}`);
    } else cartItems.map((i) => this.addCartItem(i));
  }

  async getCartToView(): Promise<CartDTO> {
    const cart = await this.getCart();

    return cart.toPersistent();
  }

  async addCartItem(data: {
    productId: number;
    quantity: number;
    clientId: number;
  }): Promise<CartDTO> {
    const cart = await this.getCart();

    const product = await this.productService.getProductById(data.productId);
    product.setQuantity(data.quantity);

    const productData = product.toView();

    if (!data.clientId || !data.clientId)
      throw new AppError("DOMAIN", "Клієнта не вказано");

    cart.addItem({
      productId: data.productId,
      name: productData.name,
      price: productData.price,
      quantity: data.quantity,
      total: productData.totalAmount,
    });

    cart.setClientId = data.clientId;

    await this.cartReposirory.save(cart);

    return this.getCartToView();
  }

  async deleteCartItem(productId: number): Promise<CartDTO> {
    const cart = await this.getCart();

    const cartItem = cart.getItem(productId);
    if (!cartItem) throw new AppError("SERVICE", "Позиція відсутня!");

    await this.cartReposirory.deleteCartItem(productId, cart.id);

    return this.getCartToView();
  }

  async deleteCart() {
    return this.resetCart();
  }

  async resetCart() {
    return await this.cartReposirory.delete();
  }
}
