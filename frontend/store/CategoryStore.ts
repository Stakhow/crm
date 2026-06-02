import { create } from 'zustand';
import { productService } from '../../backend';
import type { ProductCategory } from '../../backend/domain/product/ProductCategory';
import type { ProductCategoryDTO } from '../../dto/ProductCategoryDTO';
import { AppError } from '../../utils/error';
import { notify } from './NotificationStore';
import { devtools } from 'zustand/middleware';

interface CategoryState {
    categories: ProductCategoryDTO[];
    categoryName: ProductCategory;
    categoryNames: ProductCategory[];
    isLoading: boolean;
    error: string;
    getCategories: () => void;
    setCategory: (categoryName: ProductCategory) => void;
    setCategories: (categoryNames: ProductCategory[]) => void;
}

const name = 'category';
export const categoryStore = create<CategoryState>()(
    devtools(
        (set, get) => {
            const handleRequest = async (
                actionName: string,
                errorMessage: string,
                requestFn: () => Promise<void>,
                onStartInit: Partial<CategoryState> = { isLoading: true, error: '' }
            ): Promise<any> => {
                set(onStartInit, false, `${name}/${actionName}:start`);
                try {
                    return await requestFn();
                } catch (error: unknown) {
                    const msg = error instanceof AppError ? error.message : 'Невідома помилка';
                    set({ error: msg, isLoading: false }, false, `${name}/${actionName}:error`);
                    notify.error(`${errorMessage}: ${get().error}`);
                    throw error;
                }
            };

            return {
                categories: [],
                categoryName: undefined,
                categoryNames: undefined,
                isLoading: false,
                error: '',

                getCategories: () =>
                    handleRequest(
                        'getCategories',
                        'Помилка отримання категорій',
                        async () => {
                            const categories = await productService.getCategories();
                            set({ isLoading: false, categories }, false, `${name}/getCategories:success`);
                        },
                        { categories: [], categoryName: undefined, isLoading: true, error: '' }
                    ),

                setCategory: (categoryName) => set({ categoryName }, false, 'category/setCategory'),
                setCategories: (categoryNames) => set({ categoryNames }, false, 'category/setCategories'),
            };
        },
        { name, enabled: false },
    ),
);