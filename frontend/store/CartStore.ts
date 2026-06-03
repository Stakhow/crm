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
    addCartItem: (productId: string, quantity: number) => CartDTO;
    deleteCartItem: (cartItemId: string) => void;
    deleteCart: () => void;
}

const name = 'cartStore';
export const cartStore = create<CartState>()(
    devtools(
        (set, get) => {
            const handleRequest = async (
                actionName: string,
                errorMessage: string,
                requestFn: () => Promise<void>,
                onStartInit: Partial<CartState> = { isLoading: true, error: '' },
            ): Promise<any> => {
                set(onStartInit, false, `${name}/${actionName}:start`);
                try {
                    return await requestFn();
                } catch (error: unknown) {
                    console.log(error);
                    const msg = error instanceof AppError ? error.message : 'Невідома помилка';
                    set({ error: msg, isLoading: false }, false, `${name}/${actionName}:error`);
                    notify.error(`${errorMessage}: ${get().error}`);
                    throw error;
                }
            };

            return {
                cart: undefined,
                clientId: undefined,
                isLoading: false,
                items: [],
                error: '',

                getCartToView: (id) => {
                    if (!!id) localStorage.setItem(CART_ID_KEY, id);
                    const cartId = localStorage.getItem(CART_ID_KEY) || '';

                    return handleRequest(
                        'getCartToView',
                        'Помилка отримання корзини',
                        async () => {
                            const cart = await cartService.getCartToView(cartId);
                            const items = await cartItemsMap(cart);

                            set(
                                { cart, cartId: cart.id, isLoading: false, items },
                                false,
                                `${name}/getCartToView:success`,
                            );
                        },
                        { cart: undefined, cartId: undefined, isLoading: true, items: [], error: '' },
                    ).catch(() => {
                        localStorage.removeItem(CART_ID_KEY);
                    }) as any;
                },

                addCartItem: (productId, quantity) =>
                    handleRequest('addCartItem', 'Помилка додавання товару', async () => {
                        const cart = await cartService.addCartItem({
                            productId,
                            quantity,
                            cartId: localStorage.getItem(CART_ID_KEY) || '',
                        });
                        const items = await cartItemsMap(cart);
                        set({ cart, cartId: cart.id, isLoading: false, items }, false, `${name}/addCartItem:success`);
                        if (!!cart) localStorage.setItem(CART_ID_KEY, cart.id);
                        notify.success(`Товар додано в корзину`);
                    }) as any,

                deleteCartItem: (productId) => {
                    const cartId = localStorage.getItem(CART_ID_KEY);
                    if (!cartId) {
                        notify.error('ID Корзини не існує');
                        return;
                    }

                    handleRequest(
                        'deleteCartItem',
                        'Помилка видалення товару',
                        async () => {
                            const cart = await cartService.deleteCartItem(cartId, productId);
                            const items = await cartItemsMap(cart);
                            set(
                                { cart, cartId: cart.id, isLoading: false, items },
                                false,
                                `${name}/deleteCartItem:success`,
                            );
                            notify.success(`Товар видалено з корзини`);
                        },
                        { isLoading: true, cart: undefined, cartId: undefined } as any,
                    );
                },

                deleteCart: () => {
                    const cartId = localStorage.getItem(CART_ID_KEY) || '';

                    handleRequest(
                        'deleteCart',
                        'Помилка видалення корзини',
                        async () => {
                            await cartService.deleteCart(cartId);

                            localStorage.removeItem(CART_ID_KEY);

                            set(
                                { cart: undefined, cartId: undefined, isLoading: false, items: [] },
                                false,
                                `${name}/deleteCart:success`,
                            );

                            notify.success(`Корзину видалено`);
                        },
                        { isLoading: true, cart: undefined } as any,
                    );
                },
            };
        },
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
