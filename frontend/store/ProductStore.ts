import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { productService } from '../../backend';
import { AppError } from '../../utils/error';
import { notify } from './NotificationStore';
import type { ProductCategory } from '../../backend/domain/product/ProductCategory';
import type { CreateProductDTO } from '../../dto/ProductToCreateDTO';
import type { ProductViewDTO, ProductViewUIDTO } from '../../dto/ProductViewDTO';
import { priceFormat, quantityFormat } from '../../utils/utils';

export type CreateProductUIDTO = {
    fields: ProductFieldType[];
    categoryName: ProductCategory;
};

type ProductFieldType = {
    name: string;
    title: string;
    fieldType: string;
    value: string | number;
    placeholder: string;
};

interface ProductState {
    products: ProductViewUIDTO[];
    productId: string;
    product: ProductViewUIDTO | undefined;
    isLoading: boolean;
    error: string;
    success: boolean;
    productAmount: number;
    propsToCreate: CreateProductUIDTO;
    productsToProduce: ProductViewUIDTO[];
    initCreate: () => void;
    selectProduct: (id: 'new' | string) => void;
    getProducts: (categoryName?: ProductCategory) => ProductViewUIDTO[];
    getProductsByIds: (ids: string[]) => ProductViewUIDTO[];
    getProduct: (id: string, categoryName?: ProductCategory) => ProductViewUIDTO;
    getProductProps: (categoryName: ProductCategory) => CreateProductDTO;
    getProductAmount: (id: string, quantity: number) => number;
    deleteProduct: (id: string) => number;
    updateProductQuantity: (productId: string, unitOperation: 'add' | 'subtract', quantity: number) => void;

    createProduct: (values: CreateProductUIDTO) => ProductViewUIDTO;
    updateProduct: (id: string, values: CreateProductUIDTO) => ProductViewUIDTO;

    getProductsToProduce: () => ProductViewUIDTO[];
    setProductAsProduced: (id: string) => void;
}

const name = 'productStore';

const BASE_PRODUCT_FIELDS = [
    { name: 'length', title: 'Довжина', value: (v: any) => `${v} см` },
    { name: 'width', title: 'Ширина', value: (v: any) => `${v} см` },
    { name: 'thickness', title: 'Товщина', value: (v: any) => `${v} мкм` },
];

export const productStore = create<ProductState>()(
    devtools(
        (set, get) => {
            // Універсальний хелпер для обробки асинхронних запитів
            const handleRequest = async <T>(
                actionName: string,
                errorMessage: string,
                requestFn: () => Promise<T>,
                onStartInit: Partial<ProductState> = { isLoading: true, error: '', success: false },
            ): Promise<T | undefined> => {
                set(onStartInit, false, `${name}/${actionName}:start`);
                try {
                    const result = await requestFn();
                    set({ isLoading: false, success: true }, false, `${name}/${actionName}:success`);
                    return result;
                } catch (error: unknown) {
                    const msg = error instanceof AppError ? error.message : 'Невідома помилка';
                    set({ error: msg, isLoading: false, success: false }, false, `${name}/${actionName}:error`);
                    notify.error(`${errorMessage}: ${msg}`);
                    return undefined;
                }
            };

            const resetProductState = {
                productId: undefined,
                product: undefined,
                products: [],
                propsToCreate: undefined,
            };

            return {
                products: [],
                product: undefined,
                productId: undefined,
                isLoading: false,
                error: '',
                success: true,
                propsToCreate: undefined,
                productsToProduce: [],
                productAmount: 0,

                initCreate: () => set({ product: undefined, products: [], error: '' }, false, `${name}/initCreate`),

                selectProduct: (id) => {
                    set(
                        {
                            propsToCreate: undefined,
                            productId: id,
                            product: id === 'new' ? undefined : get().products.find((i) => i.id === id),
                        },
                        false,
                        `${name}/selectProduct:success`,
                    );
                },

                getProducts: (categoryName) =>
                    handleRequest(
                        'getProducts',
                        'Помилка отримання продуктів',
                        async () => {
                            const raw = await productService.getProductsToView(categoryName);
                            const products = raw.map((i) => productMapper(i));
                            set({ products });
                            return products;
                        },
                        { isLoading: true, error: '', success: false, ...resetProductState },
                    ),

                getProductsToProduce: () =>
                    handleRequest(
                        'getProductsToProduce',
                        'Помилка отримання списку на виконання',
                        async () => {
                            const raw = await productService.getProductsToProduce();
                            const productsToProduce = raw.map(productMapperShort);
                            set({ productsToProduce, product: undefined });
                            return productsToProduce;
                        },
                        { isLoading: true, error: '', success: false, productsToProduce: [] },
                    ),

                getProductsByIds: (ids) =>
                    handleRequest(
                        'getProductsByIds',
                        'Помилка отримання продуктів',
                        async () => {
                            const raw = await productService.getProductByIdsToView(ids);
                            set({ products: raw.map((i) => productMapper(i)), product: undefined });
                        },
                        { isLoading: true, error: '', success: false, ...resetProductState },
                    ),

                getProductAmount: (id, quantity) =>
                    handleRequest(
                        'getProductAmount',
                        'Помилка обчислення вартості',
                        async () => {
                            const productAmount = await productService.getTotalAmount(id, quantity);
                            set({ productAmount });
                            return productAmount;
                        },
                        { productAmount: 0 },
                    ),

                getProduct: (id) =>
                    handleRequest(
                        'getProduct',
                        'Помилка отримання продукту',
                        async () => {
                            const raw = await productService.getProductToView(id);
                            const product = productMapper(raw);
                            set({
                                product,
                                propsToCreate: fieldsForEdit({ categoryName: raw.categoryName, fields: raw.fields }),
                            });
                        },
                        { isLoading: true, error: '', success: false, ...resetProductState },
                    ),

                deleteProduct: (id) =>
                    handleRequest(
                        'deleteProduct',
                        'Помилка видалення продукту',
                        async () => {
                            await productService.delete(id);
                            set({ products: get().products.filter((i) => i.id !== id), product: undefined });
                            notify.success('Продукт видалено');
                            return id;
                        },
                        { isLoading: true, product: undefined, products: [], error: '', success: false },
                    ),

                updateProductQuantity: (...args) =>
                    handleRequest('updateProductQuantity', 'Помилка оновлення кількості', async () => {
                        const updated = await productService.updateProductQuantity(...args);
                        set({
                            products: get().products.map((i) => (i.id === updated.id ? productMapper(updated) : i)),
                        });
                        notify.success('Кількість оновлено');
                    }),

                getProductProps: async (categoryName) => {
                    set({ propsToCreate: undefined });
                    try {
                        const props = await productService.getProductProps(categoryName);
                        set({ propsToCreate: fieldsForCreate(props) });
                    } catch {}
                },

                createProduct: (values) =>
                    handleRequest(
                        'createProduct',
                        'Помилка створення',
                        async () => {
                            const raw = await productService.createProduct({
                                categoryName: values.categoryName,
                                fields: fieldsToMap(values.fields),
                            });
                            const product = productMapper(raw);
                            set({ product });
                            notify.success('Продукт створено');
                            return raw;
                        },
                        { isLoading: true, error: '', success: false, ...resetProductState },
                    ),

                updateProduct: (id, values) =>
                    handleRequest(
                        'updateProduct',
                        'Помилка оновлення',
                        async () => {
                            const raw = await productService.updateProduct(id, {
                                categoryName: values.categoryName,
                                fields: fieldsToMap(values.fields),
                            });
                            const product = productMapper(raw);
                            set({
                                product,
                                propsToCreate: fieldsForEdit({ categoryName: raw.categoryName, fields: raw.fields }),
                            });
                            notify.success('Продукт оновлено');
                            return raw;
                        },
                        { isLoading: true, error: '', success: false, ...resetProductState },
                    ),

                setProductAsProduced: (id) =>
                    handleRequest(
                        'setProductAsProduced',
                        'Помилка встановлення',
                        async () => {
                            await productService.setProductAsProduced(id);
                            set({ productsToProduce: get().productsToProduce.filter((i) => i.id !== id) });
                            notify.success('Продукт виготовлено');
                        },
                        { isLoading: true, error: '' },
                    ),
            };
        },
        { name, enabled: false },
    ),
);


function productMapper(product: ProductViewDTO, includeBagFields = true): ProductViewUIDTO {
    const bagFields =
        includeBagFields && product.categoryName === 'bag'
            ? [
                  { name: 'weightPerUnit', title: 'Вага', value: (v: any) => `${quantityFormat(v, 'kilogram')}/шт.` },
                  { name: 'pricePerUnit', title: 'Ціна', value: (v: any) => `${priceFormat(v)}/шт.` },
              ]
            : [];

    const fields = [...BASE_PRODUCT_FIELDS, ...bagFields]
        .filter((i) => Object.hasOwn(product.fields, i.name))
        .map((i) => ({ title: i.title, value: i.value(product.fields[i.name]) }));

    return { ...product, fields };
}

const productMapperShort = (product: ProductViewDTO) => productMapper(product, false);

const getBaseFormFields = (categoryName: string) =>
    [
        { name: 'name', title: 'Назва продукту', fieldType: 'text' },
        { name: 'width', title: 'Ширина (см)', fieldType: 'number' },
        { name: 'length', title: 'Довжина (см)', fieldType: 'number' },
        { name: 'thickness', title: 'Товщина (мкм)', fieldType: 'number' },
        { name: 'quantity', title: `Кількість (${categoryName === 'bag' ? 'шт.' : 'кг'})`, fieldType: 'number' },
        { name: 'price', title: 'Ціна', fieldType: 'number' },
    ].map((f) => ({ ...f, value: '', placeholder: '' }));

function fieldsForCreate(data: CreateProductDTO): CreateProductUIDTO {
    return {
        categoryName: data.categoryName,
        fields: getBaseFormFields(data.categoryName).filter((i) => Object.hasOwn(data.fields, i.name)),
    };
}

function fieldsForEdit(data: CreateProductDTO): CreateProductUIDTO {
    const allowedEditNames = ['name', 'quantity', 'price'];
    const fields = getBaseFormFields(data.categoryName)
        .filter((i) => allowedEditNames.includes(i.name) && Object.hasOwn(data.fields, i.name))
        .map((i) => ({ ...i, value: data.fields[i.name as keyof CreateProductDTO['fields']] }));

    return { categoryName: data.categoryName, fields };
}

const fieldsToMap = (fields: ProductFieldType[]) => Object.fromEntries(fields.map((i) => [i.name, i.value]));
