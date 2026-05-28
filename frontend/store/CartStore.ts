import { create } from 'zustand';
import { cartService, productService } from '../../backend';
import { AppError } from '../../utils/error';
import { notify } from './NotificationStore';
import { devtools } from 'zustand/middleware';
import type { CartDTO, CartItemDTO } from '../../dto/CartDTO';

type CartItemView = CartItemDTO & {
    unit: 'kilogram' | 'piece';
};

const CART_ID_KEY = 'cartId';

interface CartState {
    cart: CartDTO | undefined;
    cartId: string;
    isLoading: boolean;
    error: string;
    items: CartItemView[];
    getCartToView: (id?: string) => CartDTO;
    addCartItem: (data: { productId: string; quantity: number }) => CartDTO;
    deleteCartItem: (cartItemId: string) => void;
    deleteCart: () => void;
}

const name = 'cartStore';
export const cartStore = create<CartState>()(
    devtools(
        (set, get) => ({
            cart: undefined,
            clientId: undefined,
            isLoading: false,
            items: [],
            error: '',

            getCartToView: async (id) => {
                if (!!id) localStorage.setItem(CART_ID_KEY, id);

                const cartId = localStorage.getItem(CART_ID_KEY);

                if (!cartId) return;

                set(
                    { cart: undefined, cartId: undefined, isLoading: true, items: [], error: '' },
                    false,
                    `${name}/getCartToView:start`,
                );

                try {
                    const cart = await cartService.getCartToView(cartId);
                    const items = await cartItemsMap(cart);

                    set(
                        {
                            cart: cart,
                            cartId: cart.id,
                            isLoading: false,
                            items,
                        },
                        false,
                        `${name}/getCartToView:success`,
                    );
                } catch (error: unknown) {
                    console.log(error);
                    if (error instanceof AppError)
                        set({ error: error.message }, false, `${name}/getCartToView:errorMessage`);
                    set({ isLoading: false }, false, `${name}/getCartToView:error`);
                    notify.error(`Помилка отримання корзини: ${get().error}`);

                    // localStorage.removeItem(CART_ID_KEY);
                }
            },
            addCartItem: async (props) => {
                set({ isLoading: true }, false, `${name}/addCartItem:start`);

                try {
                    const cart = await cartService.addCartItem({
                        ...props,
                        cartId: localStorage.getItem(CART_ID_KEY) || '',
                    });
                    const items = await cartItemsMap(cart);

                    set(
                        {
                            cart: cart,
                            isLoading: false,
                            items,
                        },
                        false,
                        `${name}/addCartItem:success`,
                    );

                    if (!!cart) localStorage.setItem(CART_ID_KEY, cart.id);

                    notify.success(`Товар додано в корзину`);
                } catch (error: unknown) {
                    console.log(error);
                    if (error instanceof AppError)
                        set({ error: error.message }, false, `${name}/addCartItem:errorMessage`);

                    set({ isLoading: false }, false, `${name}/addCartItem:error`);
                    notify.error(`Помилка додавання товару: ${get().error}`);
                }
            },
            deleteCartItem: async (cartItemId) => {
                set({ isLoading: true }, false, `${name}/deleteCartItem:start`);

                const cartId = localStorage.getItem(CART_ID_KEY);
                if (!cartId) return notify.error('ID Корзини не існує');

                try {
                    const cart = await cartService.deleteCartItem(cartId, cartItemId);
                    const items = await cartItemsMap(cart);

                    if (cart.items.length === 0) {
                        localStorage.removeItem(CART_ID_KEY);
                    }

                    set(
                        {
                            cart: cart,
                            isLoading: false,
                            items,
                        },
                        false,
                        `${name}/deleteCartItem:success`,
                    );

                    notify.success(`Товар видалено з корзини`);
                } catch (error: unknown) {
                    console.log(error);
                    if (error instanceof AppError)
                        set({ error: error.message }, false, `${name}/deleteCartItem:errorMessage`);
                    set({ isLoading: false }, false, `${name}/deleteCartItem:error`);
                    notify.error(`Помилка видалення товару: ${get().error}`);
                }
            },
            deleteCart: async () => {
                set({ isLoading: true, cart: undefined }, false, `${name}/deleteCart:start`);

                const cartId = localStorage.getItem(CART_ID_KEY);
                if (!cartId) return;

                try {
                    await cartService.deleteCart(cartId);

                    localStorage.removeItem(CART_ID_KEY);

                    set(
                        {
                            cart: undefined,
                            cartId: undefined,
                            isLoading: false,
                            items: undefined,
                        },
                        false,
                        `${name}/deleteCart:success`,
                    );

                    notify.success(`Корзину видалено`);
                } catch (error: unknown) {
                    console.log(error);
                    if (error instanceof AppError)
                        set({ error: error.message }, false, `${name}/deleteCart:errosMessage`);
                    set({ isLoading: false }, false, `${name}/deleteCart:error`);
                    notify.error(`Помилка видалення корзини: ${get().error}`);
                }
            },
        }),
        { name, enabled: false },
    ),
);

async function cartItemsMap(cart: CartDTO) {
    const products = await productService.getProductByIdsToViewMap(cart.productsIds);

    const items = cart.items.map((i): CartItemView => {
        const product = products.get(i.productId);

        const unit = !!product && product.unit;

        return { ...i, unit: !!unit ? unit : 'kilogram' };
    });

    return items;
}
