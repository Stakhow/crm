import { AppError } from "../../utils/error";
import { Cart, CartItem } from "../domain/cart/Cart";
import { CartRepository } from "../repositories/cart/CartRepository";
import type { ProductService } from "./ProductService";
import type { CartViewDTO } from "../../dto/CartViewDTO";
import type { ClientService } from "./ClientService";

export class CartService {
  constructor(
    private cartReposirory: CartRepository,
    private productService: ProductService,
    private clientService: ClientService,
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

  async getCartToView(): Promise<CartViewDTO> {
    const cart = await this.getCart();
    const cartItemsMap = cart.getItemsMap();

    const products = await this.productService.getProductByIds(
      Array.from(cartItemsMap.keys()),
    );

    const client = cart.clientId
      ? await this.clientService.getById(cart.clientId)
      : undefined;

    return {
      ...cart.toPersistent(),
      client,
      products: products.map((i) => {
        const cartItem = cart.getItem(i.id);
        const stock = i.getWeight;
        if (cartItem) i.setMainParam(cartItem.quantity);

        return { ...i.toView(), stock };
      }),
    };
  }

  async addCartItem(data: {
    productId: number;
    quantity: number;
    clientId: number;
  }): Promise<CartViewDTO> {
    const cart = await this.getCart();

    const product = await this.productService.getProduct(data.productId);
    product.setMainParam(data.quantity);

    const productData = product.toView();

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

  async deleteCartItem(productId: number): Promise<CartViewDTO> {
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
