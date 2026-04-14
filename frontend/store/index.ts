import { create } from 'zustand';
import { cartService } from '../../backend';
import type { CartViewDTO } from '../../dto/CartViewDTO';
import { AppError } from '../../utils/error';
import type { OrderFormValues } from '../src/routes/OrderNewPage';

export type RootState = ReturnType<typeof cartStore.getState>;

interface CartState {
    data: CartViewDTO | undefined;
    isLoading: boolean;
    error: object | null;
    list: OrderFormValues['list'];
    productsInCart: number[];
    fetchData: () => void;

    addCartItem: (data: { productId: number; quantity: number; clientId: number }) => void;
    deleteCartItem: (id: number) => void;
    deleteCart: () => void;
}

export const cartStore = create<CartState>((set) => ({
    data: undefined,
    isLoading: false,
    list: [],
    productsInCart: [],
    error: null,
    fetchData: async () => {
        set({ isLoading: true });

        try {
            const data = await cartService.getCartToView();

            const products = data.products;

            set({
                data,
                isLoading: false,
                list: products.map((i) => ({
                    categoryName: i.categoryName,
                    id: i.id,
                    quantity: i.quantity,
                    stock: i.stock,
                })),
                productsInCart: products.map(({ id }) => id),
            });
            // @ts-ignore
        } catch (err: AppError) {
            set({ error: err.message, isLoading: false });
        }
    },
    addCartItem: async (props) => {
        set({ isLoading: true });

        try {
            const data = await cartService.addCartItem(props);

            const products = data.products;

            set({
                data,
                isLoading: false,
                list: products.map((i) => ({
                    categoryName: i.categoryName,
                    id: i.id,
                    quantity: i.quantity,
                    stock: i.stock,
                })),
                productsInCart: products.map(({ id }) => id),
            });
            // @ts-ignore
        } catch (err: AppError) {
            set({ error: err.message, isLoading: false });
        }
    },
    deleteCartItem: async (id) => {
        set({ isLoading: true });

        try {
            const data = await cartService.deleteCartItem(id);

            const products = data.products;

            set({
                data,
                isLoading: false,
                list: products.map((i) => ({
                    categoryName: i.categoryName,
                    id: i.id,
                    quantity: i.quantity,
                    stock: i.stock,
                })),
                productsInCart: products.map(({ id }) => id),
            });
            // @ts-ignore
        } catch (err: AppError) {
            set({ error: err.message, isLoading: false });
        }
    },
    deleteCart: async () => {
        set({ isLoading: true });
        try {
            set({
                data: undefined,
                isLoading: false,
                list: undefined,
                productsInCart: undefined,
            });
        } catch (error) {
            // @ts-ignore
            set({ error: error.message, isLoading: false });
        }
    },
}));
