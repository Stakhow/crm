import { create } from 'zustand';
import { cartService, productService } from '../../backend';
import { AppError } from '../../utils/error';
import { notify } from './NotificationStore';
import { devtools } from 'zustand/middleware';
import type { CartDTO } from '../../dto/CartDTO';
import type { CartItemProps } from '../../backend/domain/cart/Cart';

type CartItemView = CartItemProps & {
    unit: 'kilogram' | 'piece';
};

interface CartState {
    cart: CartDTO | undefined;
    clientId: number;
    isLoading: boolean;
    error: string;
    items: CartItemView[];
    productsInCart: number[];
    getCartToView: () => CartDTO;
    addCartItem: (data: { productId: number; quantity: number; clientId: number }) => CartDTO;
    deleteCartItem: (id: number) => void;
    deleteCart: () => void;
}

const name = 'cartStore';
export const cartStore = create<CartState>()(
    devtools(
        (set, get) => ({
            cart: undefined,
            isLoading: false,
            items: [],
            productsInCart: [],
            error: '',
            getCartToView: async () => {
                set(
                    { cart: undefined, isLoading: true, items: [], productsInCart: [], error: '' },
                    false,
                    `${name}/getCartToView:start`,
                );

                try {
                    const cart = await cartService.getCartToView();
                    const items = await cartItemsMap(cart);

                    set(
                        {
                            cart: cart,
                            isLoading: false,
                            items,
                            productsInCart: cart.productsIds,
                            clientId: cart.clientId,
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
                    const items = await cartItemsMap(cart);

                    set(
                        {
                            cart: cart,
                            isLoading: false,
                            items,
                            productsInCart: cart.productsIds,
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
                    const items = await cartItemsMap(cart);

                    set(
                        {
                            cart: cart,
                            isLoading: false,
                            items,
                            productsInCart: cart.productsIds,
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
                    await cartService.deleteCart();

                    set(
                        {
                            cart: undefined,
                            isLoading: false,
                            items: undefined,
                            productsInCart: undefined,
                            clientId: undefined,
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

async function cartItemsMap(cart: CartDTO) {
    const products = await productService.getProductByIdsToViewMap(cart.productsIds);

    const items = cart.items.map((i): CartItemView => {
        const product = products.get(i.productId);
        const unit = !!product && product.categoryName === 'bag' ? 'piece' : 'kilogram';

        return { ...i, unit };
    });

    return items;
}
