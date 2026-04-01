import { AppError } from "../../utils/error";
import { Cart, CartItem } from "../domain/cart/Cart";
import { CartRepository } from "../repositories/cart/CartRepository";
import type { ProductService } from "./ProductService";

export class CartService {
  constructor(
    private cartReposirory: CartRepository,
    private productService: ProductService,
  ) {}

  async getCart() {
    return await this.cartReposirory.load();
  }

  async getCartToView() {
    const cart = await this.getCart();
    const cartItemsMap = cart.getItemsMap();

    const products = await this.productService.getProductByIds(
      Array.from(cartItemsMap.keys()),
    );

    return {
      ...cart.toPersistent(),
      products: products.map((i) => {
        i.setMainParam(cart.getItem(i.id).quantity);

        return i.toView();
      }),
    };
  }

  async addCartItem(data: {
    productId: number;
    quantity: number;
    clientId: number;
  }) {
    const cart = await this.getCart();

    const product = await this.productService.getProduct(data.productId);
    product.setMainParam(data.quantity);
    cart.addItem({
      productId: data.productId,
      name: product.name,
      price: product.getPrice,
      quantity: data.quantity,
      total: product.getTotalAmount(),
    });

    cart.setClientId = data.clientId;

    await this.cartReposirory.save(cart);

    await this.productService.updateProductMainParam(data.productId, {
      unitOperation: "subtract",
      param: data.quantity,
    });
  }

  async deleteCartItem(productId: number) {
    const cart = await this.getCart();

    const cartItem = cart.getItem(productId);

    if (!!cartItem) {
      await this.productService.updateProductMainParam(productId, {
        unitOperation: "add",
        param: cartItem.quantity,
      });

      await this.cartReposirory.deleteCartItem(productId, cart.id);
    } else throw new AppError("SERVICE", "Позиція відсутня!");
  }

  async deleteCart() {
    const cart = await this.getCart();

    await Promise.all(
      cart.getItems().map((i) =>
        this.productService.updateProductMainParam(i.productId, {
          unitOperation: "add",
          param: i.quantity,
        }),
      ),
    );

    return this.resetCart();
  }

  async resetCart() {
    return await this.cartReposirory.delete();
  }
}
