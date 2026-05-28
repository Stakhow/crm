import { create } from 'zustand';
import { productService } from '../../backend';
import { AppError } from '../../utils/error';
import { notify } from './NotificationStore';
import type { ProductCategory } from '../../backend/domain/product/ProductCategory';
import type { CreateProductDTO } from '../../dto/ProductToCreateDTO';
import type { ProductViewDTO, ProductViewUIDTO } from '../../dto/ProductViewDTO';
import { devtools } from 'zustand/middleware';
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
    initCreate: () => void;
    selectProduct: (id: string) => void;
    getProducts: (categoryName?: ProductCategory) => ProductViewUIDTO[];
    getProductsByIds: (ids: string[]) => ProductViewUIDTO[];
    getProduct: (id: string, categoryName?: ProductCategory) => ProductViewUIDTO;
    getProductProps: (categoryName: ProductCategory) => CreateProductDTO;
    getProductAmount: (id: string, quantity: number) => number;
    deleteProduct: (id: string) => number;
    updateProductQuantity: (productId: string, unitOperation: 'add' | 'subtract', quantity: number) => void;

    createProduct: (values: CreateProductUIDTO) => ProductViewUIDTO;
    updateProduct: (id: string, values: CreateProductUIDTO) => ProductViewUIDTO;
    getProductsToOrder: (categoryName: ProductCategory) => ProductViewUIDTO[];
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
                            products: products.map((i) => productMapper(i)),
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
            getProductsByIds: async (ids) => {
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
                    `${name}/getProductsByIds:start`,
                );

                try {
                    const products = await productService.getProductByIdsToView(ids);
                    set(
                        {
                            products: products.map((i) => productMapper(i)),
                            isLoading: false,
                            product: undefined,
                            success: true,
                        },
                        false,
                        `${name}/getProductsByIds:success`,
                    );
                } catch (error: unknown) {
                    if (error instanceof AppError)
                        set({ error: error.message }, false, `${name}/getProductsByIds:errorMessage`);
                    set({ isLoading: false }, false, `${name}/getProductsByIds:error`);
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
            getProduct: async (id) => {
                set(
                    {
                        isLoading: true,
                        product: undefined,
                        products: [],
                        error: '',
                        success: false,
                        propsToCreate: undefined,
                    },
                    false,
                    `${name}/getProduct:start`,
                );

                try {
                    const product = await productService.getProductToView(id);

                    set(
                        {
                            isLoading: false,
                            product: productMapper(product),
                            success: true,
                            propsToCreate: fieldsForEdit({
                                categoryName: product.categoryName,
                                fields: product.fields,
                            }),
                        },
                        false,
                        `${name}/getProduct:success`,
                    );
                } catch (error: unknown) {
                    console.log(error);
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
            updateProductQuantity: async (...arg) => {
                set({ isLoading: true, error: '', success: false }, false, `${name}/updateProductQuantity:start`);

                try {
                    const product = await productService.updateProductQuantity(...arg);
                    const products = get().products;
                    set(
                        {
                            isLoading: false,
                            products: products.map((i) => (i.id === product.id ? productMapper(product) : i)),
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
            getProductProps: async (categoryName) => {
                set({ propsToCreate: undefined });

                try {
                    const propsToCreate = await productService.getProductProps(categoryName);
                    console.log(propsToCreate);
                    set({
                        propsToCreate: fieldsForCreate(propsToCreate),
                    });
                } catch (error) {}
            },
            createProduct: async (values) => {
                set(
                    { isLoading: true, product: undefined, products: [], error: '', success: false },
                    false,
                    `${name}/createProduct:start`,
                );

                try {
                    const product = await productService.createProduct({
                        categoryName: values.categoryName,
                        fields: fieldsToMap(values.fields),
                    });

                    set(
                        {
                            isLoading: false,
                            product: productMapper(product),
                            success: true,
                        },
                        false,
                        `${name}/createProduct:success`,
                    );

                    notify.success(`Продукт створено`);

                    return product;
                } catch (error: unknown) {
                    if (error instanceof AppError)
                        set({ error: error.message }, false, `${name}/createProduct:errorMessage`);
                    set({ isLoading: false }, false, `${name}/createProduct:error`);
                    notify.error(`Помилка створення: ${get().error}`);

                    console.log(error);
                }
            },
            updateProduct: async (id, values) => {
                set(
                    {
                        isLoading: true,
                        product: undefined,
                        products: [],
                        error: '',
                        success: false,
                        propsToCreate: undefined,
                    },
                    false,
                    `${name}/updateProduct:start`,
                );

                try {
                    const product = await productService.updateProduct(id, {
                        categoryName: values.categoryName,

                        fields: fieldsToMap(values.fields),
                    });

                    set(
                        {
                            isLoading: false,
                            product: productMapper(product),
                            success: true,
                            propsToCreate: fieldsForEdit({
                                categoryName: product.categoryName,
                                fields: product.fields,
                            }),
                        },
                        false,
                        `${name}/updateProduct:success`,
                    );

                    notify.success(`Продукт оновлено`);

                    return product;
                } catch (error: unknown) {
                    if (error instanceof AppError)
                        set({ error: error.message }, false, `${name}/updateProduct:errorMessage`);
                    set({ isLoading: false }, false, `${name}/updateProduct:error`);
                    notify.error(`Помилка оновлення: ${get().error}`);

                    console.log(error);
                }
            },
        }),
        { name, enabled: false },
    ),
);

function fieldsToMap(fields: ProductFieldType[]) {
    const fieldsMap = new Map(fields.map((i) => [i.name, i.value]));

    return Object.fromEntries(fieldsMap);
}

function productMapper(product: ProductViewDTO): ProductViewUIDTO {
    const fields = [
        {
            name: 'length',
            title: 'Довжина',
            value: (v: string | number) => `${v} см`,
        },
        {
            name: 'width',
            title: 'Ширина',
            value: (v: string | number) => `${v} см`,
        },
        {
            name: 'thickness',
            title: 'Товщина',
            value: (v: string | number) => `${v} мкм`,
        },
        ...(product.categoryName === 'bag'
            ? [
                  {
                      name: 'weightPerUnit',
                      title: 'Вага',
                      value: (v: string | number) => `${quantityFormat(v, 'kilogram')}/шт.`,
                  },
                  {
                      name: 'pricePerUnit',
                      title: 'Ціна',
                      value: (v: string | number) => `${priceFormat(v)}/шт.`,
                  },
              ]
            : []),
    ]
        .filter((i) => product.fields.hasOwnProperty(i.name))
        .map((i) => ({ title: i.title, value: i.value(product.fields[i.name]) }));

    return {
        ...product,
        fields,
    };
}

function fieldsForCreate(data: CreateProductDTO): CreateProductUIDTO {
    return {
        categoryName: data.categoryName,
        fields: [
            {
                name: 'name',
                title: 'Назва продукту',
                fieldType: 'text',
                value: '',
                placeholder: '',
            },
            {
                name: 'width',
                title: 'Ширина (см)',
                fieldType: 'number',
                value: '',
                placeholder: '',
            },
            {
                name: 'length',
                title: 'Довжина (см)',
                fieldType: 'number',
                value: '',
                placeholder: '',
            },
            {
                name: 'thickness',
                title: 'Товщина (мкм)',
                fieldType: 'number',
                value: '',
                placeholder: '',
            },
            {
                name: 'quantity',
                title: `Кількість (${data.categoryName === 'bag' ? 'шт.' : 'кг'})`,
                fieldType: 'number',
                value: '',
                placeholder: '',
            },
            {
                name: 'price',
                title: 'Ціна',
                fieldType: 'number',
                value: '',
                placeholder: '',
            },
        ].filter((i) => data['fields'].hasOwnProperty(i.name)),
    };
}
function fieldsForEdit(data: CreateProductDTO): CreateProductUIDTO {
    return {
        categoryName: data.categoryName,
        fields: [
            {
                name: 'name',
                title: 'Назва продукту',
                fieldType: 'text',
                value: '',
                placeholder: '',
            },
            {
                name: 'quantity',
                title: `Кількість (${data.categoryName === 'bag' ? 'шт.' : 'кг'})`,
                fieldType: 'number',
                value: '',
                placeholder: '',
            },
            {
                name: 'price',
                title: 'Ціна',
                fieldType: 'number',
                value: '',
                placeholder: '',
            },
        ]
            .filter((i) => data['fields'].hasOwnProperty(i.name))
            .map((i) => ({
                ...i,
                value: data['fields'][i.name as keyof CreateProductDTO['fields']],
            })),
    };
}
