import { create } from 'zustand';
import { productService } from '../../backend';
import type { ProductCategory } from '../../backend/domain/product/ProductCategory';
import type { ProductCategoryDTO } from '../../dto/ProductCategoryDTO';
import { AppError } from '../../utils/error';
import { notify } from './NotificationStore';
import { devtools } from 'zustand/middleware';

type ProductCategoryNameInState = ProductCategory | undefined;

interface CategoryState {
    categories: ProductCategoryDTO[];
    categoryName: ProductCategoryNameInState;
    isLoading: boolean;
    error: string;
    getCategories: () => void;
    setCategory: (categoryName: ProductCategoryNameInState) => void;
}

const name = 'category';
export const categoryStore = create<CategoryState>()(
    devtools(
        (set, get) => ({
            categories: [],
            categoryName: undefined,
            isLoading: false,
            error: '',
            getCategories: async () => {
                set(
                    { categories: [], categoryName: undefined, isLoading: true, error: '' },
                    false,
                    'category/getCategories:start',
                );

                try {
                    set(
                        {
                            isLoading: false,
                            categories: await productService.getCategories(),
                        },
                        false,
                        'category/getCategories:success',
                    );
                } catch (error: unknown) {
                    if (error instanceof AppError)
                        set({ error: error.message }, false, 'category/getCategories:errorMessage');
                    set({ isLoading: false }, false, 'category/getCategories:error');
                    notify.error(`Помилка отримання категорій: ${get().error}`);
                }
            },
            setCategory: (categoryName) => set({ categoryName }, false, 'category/setCategory'),
        }),
        { name, enabled: false },
    ),
);
