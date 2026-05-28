import { AppError } from "../../../utils/error";
import { Cart } from "../../domain/cart/Cart";
import { db } from "./../../../config/db";

export class CartRepository {
  async load(id: string): Promise<Cart> {
    const cartRow = await db.cart.get(id);

    if (!cartRow)
      throw new AppError("DOMAIN", `Корзини з таким ID:${id} не існує`);

    const cartItems = await db.cart_items.where({ cartId: id }).toArray();

    const cart = new Cart(cartRow.id, [], cartRow.createdAt);

    if (cartItems) cartItems.map((i) => cart.addItem(i));

    return cart;
  }

  async save(cart: Cart): Promise<void> {
    await this.delete(cart.id);
    const persistentCart = cart.toPersistent();

    db.transaction("rw", db.cart, db.cart_items, async () => {
      await db.cart.put(persistentCart);
      await db.cart_items.bulkPut(cart.cartItemsToDB());
    });
  }

  async delete(cartId: string) {
    console.log(cartId);
    return db.transaction("rw", db.cart, db.cart_items, async () => {
      await db.cart.where({ id: cartId }).delete();
      await db.cart_items.where({ cartId }).delete();
    });
  }

  async deleteCartItem(cartId: string, productId: string): Promise<void> {
    console.log(cartId, productId);
    await db.cart_items
      .where("[cartId+productId]")
      .equals([cartId, productId])
      .delete();

    if ((await db.cart_items.count()) === 0) await this.delete(cartId);
  }
}
