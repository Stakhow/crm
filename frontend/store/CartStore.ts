import { create } from 'zustand';
import { cartService } from '../../backend';
import { AppError } from '../../utils/error';
import type { CartViewDTO } from '../../dto/CartViewDTO';
import type { OrderFormValues } from '../src/routes/OrderNewPage';
import { notify } from './NotificationStore';
import { devtools } from 'zustand/middleware';

interface CartState {
    cart: CartViewDTO | undefined;
    isLoading: boolean;
    error: string;
    list: OrderFormValues['list'];
    productsInCart: number[];
    getCartToView: () => void;
    addCartItem: (data: { productId: number; quantity: number; clientId: number }) => void;
    deleteCartItem: (id: number) => void;
    deleteCart: () => void;
}

const name = 'cartStore';
export const cartStore = create<CartState>()(
    devtools(
        (set, get) => ({
            cart: undefined,
            isLoading: false,
            list: [],
            productsInCart: [],
            error: '',
            getCartToView: async () => {
                set(
                    { cart: undefined, isLoading: true, list: [], productsInCart: [], error: '' },
                    false,
                    `${name}/getCartToView:start`,
                );

                try {
                    const cart = await cartService.getCartToView();

                    const products = cart.products;

                    set(
                        {
                            cart: cart,
                            isLoading: false,
                            list: products.map((i) => ({
                                categoryName: i.categoryName,
                                id: i.id,
                                quantity: i.quantity,
                                stock: i.stock,
                            })),
                            productsInCart: products.map(({ id }) => id),
                        },
                        false,
                        `${name}/getCartToView:success`,
                    );
                } catch (error: unknown) {
                    if (error instanceof AppError)
                        set({ error: error.message }, false, `${name}/getCartToView:errorMessage`);
                    set({ isLoading: false }, false, `${name}/getCartToView:error`);
                    notify.error(`Помилка отримання корзини: ${get().error}`);
                }
            },
            addCartItem: async (props) => {
                set({ isLoading: true }, false, `${name}/addCartItem:start`);

                try {
                    const cart = await cartService.addCartItem(props);

                    const products = cart.products;

                    set(
                        {
                            cart: cart,
                            isLoading: false,
                            list: products.map((i) => ({
                                categoryName: i.categoryName,
                                id: i.id,
                                quantity: i.quantity,
                                stock: i.stock,
                            })),
                            productsInCart: products.map(({ id }) => id),
                        },
                        false,
                        `${name}/addCartItem:success`,
                    );
                    notify.success(`Товар додано в корзину`);
                } catch (error: unknown) {
                    if (error instanceof AppError)
                        set({ error: error.message }, false, `${name}/addCartItem:errorMessage`);

                    set({ isLoading: false }, false, `${name}/addCartItem:error`);
                    notify.error(`Помилка додавання товару: ${get().error}`);
                }
            },
            deleteCartItem: async (id) => {
                set({ isLoading: true }, false, `${name}/deleteCartItem:start`);

                try {
                    const cart = await cartService.deleteCartItem(id);

                    const products = cart.products;

                    set(
                        {
                            cart: cart,
                            isLoading: false,
                            list: products.map((i) => ({
                                categoryName: i.categoryName,
                                id: i.id,
                                quantity: i.quantity,
                                stock: i.stock,
                            })),
                            productsInCart: products.map(({ id }) => id),
                        },
                        false,
                        `${name}/deleteCartItem:success`,
                    );

                    notify.success(`Товар видалено з корзини`);
                } catch (error: unknown) {
                    if (error instanceof AppError)
                        set({ error: error.message }, false, `${name}/deleteCartItem:errorMessage`);
                    set({ isLoading: false }, false, `${name}/deleteCartItem:error`);
                    notify.error(`Помилка видалення товару: ${get().error}`);
                }
            },
            deleteCart: async () => {
                set({ isLoading: true }, false, `${name}/deleteCart:start`);
                try {
                    set(
                        {
                            cart: undefined,
                            isLoading: false,
                            list: undefined,
                            productsInCart: undefined,
                        },
                        false,
                        `${name}/deleteCart:success`,
                    );
                    notify.success(`Корзину видалено`);
                } catch (error: unknown) {
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
