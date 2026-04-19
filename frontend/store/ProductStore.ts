import { create } from 'zustand';
import { productService } from '../../backend';
import { AppError } from '../../utils/error';
import { notify } from './NotificationStore';
import type { ProductCategory } from '../../backend/domain/product/ProductCategory';
import type { ProductToCreateDTO } from '../../dto/ProductToCreateDTO';
import type { ProductViewDTO } from '../../dto/ProductViewDTO';
import { devtools } from 'zustand/middleware';

interface ProductState {
    products: ProductViewDTO[];
    productId: number;
    product: ProductViewDTO | undefined;
    isLoading: boolean;
    error: string;
    success: boolean;
    productAmount: number;
    initCreate: () => void;
    selectProduct: (id: number) => void;
    getProducts: (categoryName?: ProductCategory) => ProductViewDTO[];
    getProduct: (id: number, categoryName?: ProductCategory) => ProductViewDTO;
    getProductAmount: (id: number, quantity: number) => number;
    deleteProduct: (id: number) => number;
    updateProductQuantity: (
        productId: number,
        {
            unitOperation,
            quantity,
        }: {
            unitOperation: 'add' | 'subtract';
            quantity: number;
        },
    ) => void;

    saveProduct: (values: ProductToCreateDTO, id?: number) => ProductViewDTO;
}

const name = 'productStore';
export const productStore = create<ProductState>()(
    devtools(
        (set, get) => ({
            products: [],
            product: undefined,
            isLoading: false,
            error: '',
            success: true,
            initCreate: () => {
                set({ product: undefined, products: [], error: '' }, false, `${name}/initCreate`);
            },
            getProducts: async (categoryName) => {
                set(
                    {
                        isLoading: true,
                        productId: undefined,
                        product: undefined,
                        products: [],
                        error: '',
                        success: false,
                    },
                    false,
                    `${name}/getProducts:start`,
                );

                try {
                    const products = await productService.getProductsToView(categoryName);
                    set(
                        {
                            products,
                            isLoading: false,
                            product: undefined,
                            success: true,
                        },
                        false,
                        `${name}/getProducts:success`,
                    );
                } catch (error: unknown) {
                    if (error instanceof AppError)
                        set({ error: error.message }, false, `${name}/getProducts:errorMessage`);
                    set({ isLoading: false }, false, `${name}/getProducts:error`);
                    notify.error(`Помилка отримання продуктів: ${get().error}`);
                }
            },
            getProductAmount: async (id, quantity) => {
                set(
                    {
                        productAmount: 0,
                    },
                    false,
                    `${name}/getProductAmount:start`,
                );
                try {
                    const productAmount = await productService.getTotalAmount(id, quantity);

                    set(
                        {
                            productAmount,
                        },
                        false,
                        `${name}/getProductAmount:success`,
                    );

                    return productAmount;
                } catch (error: unknown) {
                    if (error instanceof AppError)
                        set({ error: error.message }, false, `${name}/getProductAmount:errorMessage`);
                    notify.error(`Помилка обчислення вартості: ${get().error}`);
                }
            },
            selectProduct: (id) => {
                try {
                    const product = get().products.find((i) => i.id === id);

                    set(
                        {
                            productId: id,
                            product,
                        },
                        false,
                        `${name}/selectProduct:success`,
                    );
                } catch (error: unknown) {
                    if (error instanceof AppError)
                        set({ error: error.message }, false, `${name}/selectProduct:errorMessage`);

                    set({ isLoading: false }, false, `${name}/selectProduct:error`);
                    notify.error(`Помилка вибору продукта: ${get().error}`);
                }
            },
            getProduct: async (id, categoryName) => {
                set(
                    { isLoading: true, product: undefined, products: [], error: '', success: false },
                    false,
                    `${name}/getProduct:start`,
                );

                try {
                    const product = await productService.getProductToView(id, categoryName);
                    set(
                        {
                            isLoading: false,
                            product: product,
                            success: true,
                        },
                        false,
                        `${name}/getProduct:success`,
                    );
                } catch (error: unknown) {
                    console.log('error', error);
                    if (error instanceof AppError)
                        set({ error: error.message }, false, `${name}/getProduct:errorMessage`);
                    set({ isLoading: false }, false, `${name}/getProduct:error`);
                    notify.error(`Помилка отримання продукту: ${get().error}`);
                }
            },

            deleteProduct: async (id) => {
                set(
                    { isLoading: true, product: undefined, products: [], error: '', success: false },
                    false,
                    `${name}/deleteProduct:start`,
                );

                try {
                    await productService.delete(id);

                    const products = get().products;
                    set(
                        {
                            products: products.filter((i) => i.id !== id),
                            product: undefined,
                            isLoading: false,
                            success: true,
                        },
                        false,
                        `${name}/deleteProduct:success`,
                    );

                    notify.success('Продукт видалено');

                    return id;
                } catch (error: unknown) {
                    if (error instanceof AppError)
                        set({ error: error.message }, false, `${name}/deleteProduct:errorMessage`);
                    set({ isLoading: false }, false, `${name}/deleteProduct:error`);
                    notify.error(`Помилка видалення продукту: ${get().error}`);
                }
            },
            updateProductQuantity: async (id, ...arg) => {
                set({ isLoading: true, error: '', success: false }, false, `${name}/updateProductQuantity:start`);

                try {
                    const product = await productService.updateProductQuantity(id, ...arg);
                    const products = get().products;
                    set(
                        {
                            isLoading: false,
                            products: products.map((i) => (i = i.id === product.id ? product : i)),
                            success: true,
                        },
                        false,
                        `${name}/updateProductQuantity:success`,
                    );

                    notify.success(`Кількість оновлено`);
                } catch (error: unknown) {
                    if (error instanceof AppError)
                        set({ error: error.message }, false, `${name}/updateProductQuantity:errorMessage`);
                    set({ isLoading: false }, false, `${name}/updateProductQuantity:error`);
                    notify.error(`Помилка оновлення кількості: ${get().error}`);
                }
            },

            saveProduct: async (values, id) => {
                set(
                    { isLoading: true, product: undefined, products: [], error: '', success: false },
                    false,
                    `${name}/saveProduct:start`,
                );

                try {
                    const product = await productService.saveProduct(values, id);

                    set(
                        {
                            isLoading: false,
                            product: product,
                            success: true,
                        },
                        false,
                        `${name}/saveProduct:success`,
                    );

                    notify.success(`Продукт ${!!id ? 'оновлено' : 'створено'} `);

                    return product;
                } catch (error: unknown) {
                    if (error instanceof AppError)
                        set({ error: error.message }, false, `${name}/saveProduct:errorMessage`);
                    set({ isLoading: false }, false, `${name}/saveProduct:error`);
                    notify.error(`Помилка ${!!id ? 'оновлення' : 'створення'}: ${get().error}`);
                }
            },
        }),
        { name, enabled: false },
    ),
);
