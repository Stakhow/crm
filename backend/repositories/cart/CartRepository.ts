import { Cart, CartItem } from "../../domain/cart/Cart";
import { db } from "./../../../config/db";

export class CartRepository {
  async load(): Promise<Cart> {
    const rows = await db.cart_items.toArray();
    const cartRow = await db.cart.get(0);

    const items = rows.map(
      (r) => new CartItem(r.productId, r.name, r.price, r.quantity, r.total),
    );

    return new Cart(0, items, cartRow?.createdAt, cartRow?.clientId);
  }

  async save(cart: Cart): Promise<void> {
    await this.delete();
    const persistentCart = cart.toPersistent();

    db.transaction("rw", db.cart, db.cart_items, async () => {
      const cartId = await db.cart.put({
        id: 0,
        clientId: persistentCart.clientId,
        createdAt: Date.now(),
      });

      await db.cart_items.bulkPut(
        cart.getItems().map((i) => ({
          productId: i.productId,
          name: i.name,
          price: i.price,
          quantity: i.quantity,
          cartId,
          total: i.total,
        })),
      );
    });
  }

  async delete() {
    return db.transaction("rw", db.cart, db.cart_items, async () => {
      await db.cart.clear();
      await db.cart_items.clear();
    });
  }

  async deleteCartItem(productId: number, cartId: number): Promise<void> {
    await db.cart_items
      .where("[productId+cartId]")
      .equals([productId, cartId])
      .delete();

    if ((await db.cart_items.count()) === 0) await this.delete();
  }
}
