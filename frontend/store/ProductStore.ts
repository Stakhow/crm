import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { productService, productionService } from '../../backend';
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
    values?: { title: string; value: string }[];
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
    getProduct: (id: string) => ProductViewUIDTO;
    getProductProps: (categoryName: ProductCategory, isForCart?: boolean) => CreateProductDTO;
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
                productId: '',
                isLoading: false,
                error: '',
                success: true,
                propsToCreate: undefined,
                productsToProduce: [],
                productAmount: 0,

                initCreate: () => set({ product: undefined, products: [], error: '' }, false, `${name}/initCreate`),

                selectProduct: (id) =>
                    handleRequest(
                        'selectProduct',
                        'Помилка вибору продукту',
                        async () => {
                            set(
                                {
                                    productId: id,
                                    product: id === 'new' ? undefined : get().products.find((i) => i.id === id),
                                },
                                false,
                                `${name}/selectProduct:success`,
                            );
                        },
                        {
                            isLoading: true,
                            error: '',
                            success: false,
                            product: undefined,
                            productId: undefined,
                            propsToCreate: undefined,
                        },
                    ),

                getProducts: (categoryName) =>
                    handleRequest(
                        'getProducts',
                        'Помилка отримання продуктів',
                        async () => {
                            const raw = await productService.getProductsToView(categoryName);
                            const products = raw.map((i) => productMapper(i));
                            set({ products, isLoading: false });
                            return products;
                        },
                        { isLoading: true, error: '', success: false, ...resetProductState },
                    ),

                getProductsToProduce: () =>
                    handleRequest(
                        'getProductsToProduce',
                        'Помилка отримання списку на виконання',
                        async () => {
                            const raw = await productionService.getAll();
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
                            const productRaw = await productService.getProductToView(id);
                            const product = productMapper(productRaw);
                            set({
                                product,
                                productId: product.id,
                                propsToCreate: fieldsForEdit({
                                    categoryName: productRaw.categoryName,
                                    fields: productRaw.fields,
                                }),
                            });
                        },
                        { isLoading: true, error: '', success: false, product: undefined, productId: undefined },
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

                getProductProps: async (categoryName, isForCart) => {
                    set({ propsToCreate: undefined });
                    try {
                        const props = await productService.getProductProps(categoryName);
                        if (isForCart) delete props.fields.quantity;

                        set({ propsToCreate: fieldsForCreate(props) });
                    } catch {}
                },

                createProduct: (values) =>
                    handleRequest(
                        'createProduct',
                        'Помилка створення',
                        async () => {
                            const productRaw = await productService.createProduct({
                                categoryName: values.categoryName,
                                fields: fieldsToMap(values.fields),
                            });
                            const product = productMapper(productRaw);
                            const products = [...get().products, product];
                            set({ product, productId: product.id, products, isLoading: false });
                            notify.success('Продукт створено');
                            return product;
                        },
                        { isLoading: true, error: '', success: false, product: undefined, productId: undefined },
                    ),

                updateProduct: (id, values) =>
                    handleRequest(
                        'updateProduct',
                        'Помилка оновлення',
                        async () => {
                            const productRaw = await productService.updateProduct(id, {
                                categoryName: values.categoryName,
                                fields: fieldsToMap(values.fields),
                            });
                            const product = productMapper(productRaw);
                            set({
                                product,
                                productId: product.id,
                                propsToCreate: fieldsForEdit({
                                    categoryName: productRaw.categoryName,
                                    fields: productRaw.fields,
                                }),
                            });
                            notify.success('Продукт оновлено');
                            return productRaw;
                        },
                        { isLoading: true, error: '', success: false, product: undefined, productId: undefined },
                    ),

                setProductAsProduced: (id) =>
                    handleRequest(
                        'setProductAsProduced',
                        'Помилка встановлення',
                        async () => {
                            await productionService.setDone(id);
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

function productMapper(product: ProductViewDTO, fullVariant = true): ProductViewUIDTO {
    const bagAdditionalFields =
        fullVariant && product.categoryName === 'bag'
            ? [
                  { name: 'weightPerUnit', title: 'Вага', value: (v: any) => `${quantityFormat(v, 'kilogram')}/шт.` },
                  { name: 'pricePerUnit', title: 'Ціна', value: (v: any) => `${priceFormat(v)}/шт.` },
              ]
            : [];

    const bagFields =
        product.categoryName === 'bag'
            ? [
                  { name: 'weightPerUnit', title: 'Вага', value: (v: any) => `${quantityFormat(v, 'kilogram')}/шт.` },
                  { name: 'pricePerUnit', title: 'Ціна', value: (v: any) => `${priceFormat(v)}/шт.` },
                  {
                      name: 'bagType',
                      title: 'Тип Пакета',
                      value: (v: any) => {
                          const names: any = {
                              bag: 'Пакет',
                              handle: 'Ручка',
                              't-shirt': 'Майка',
                          } as const;

                          return names[v];
                      },
                  },
              ]
            : [];

    const filmAndBagFields = ['bag', 'film'].includes(product.categoryName)
        ? [
              {
                  name: 'filmType',
                  title: 'Тип Плівки',
                  value: (v: any) => {
                      const names: any = {
                          sleeve: 'Рукав',
                          pocket: 'Карман',
                          half_sleeve: 'Напіврукав',
                          fabric: 'Полотно',
                      } as const;

                      return names[v];
                  },
              },
          ]
        : [];

    const fields = [...BASE_PRODUCT_FIELDS, ...bagFields, ...filmAndBagFields, ...bagAdditionalFields]
        .filter((i) => Object.hasOwn(product.fields, i.name))
        .map((i) => ({ title: i.title, value: i.value(product.fields[i.name]) }));

    return { ...product, fields };
}

const productMapperShort = (product: ProductViewDTO) => productMapper(product, false);

const getBaseFormFields = (categoryName: string) => {
    const isBag = categoryName === 'bag';

    const filmOptions = [
        { value: 'sleeve', title: 'Рукав' },
        { value: 'pocket', title: 'Карман' },
        { value: 'half_sleeve', title: 'Напіврукав' },
        { value: 'fabric', title: 'Полотно' },
    ];

    return [
        { name: 'name', title: 'Назва продукту', fieldType: 'text' },
        {
            name: 'bagTypes',
            title: 'Тип Пакета',
            fieldType: 'select',
            value: 'bag',
            values: [
                { value: 'bag', title: 'Пакет' },
                { value: 'handle', title: 'Ручка' },
                { value: 't-shirt', title: 'Майка' },
            ],
        },
        {
            name: 'filmTypes',
            title: 'Тип Плівки',
            fieldType: 'select',
            value: 'sleeve',
            values: isBag ? filmOptions.slice(0, 2) : filmOptions,
        },
        { name: 'width', title: 'Ширина (см)', fieldType: 'number' },
        { name: 'length', title: 'Довжина (см)', fieldType: 'number' },
        { name: 'thickness', title: 'Товщина (мкм)', fieldType: 'number' },
        { name: 'quantity', title: `Кількість (${isBag ? 'шт.' : 'кг'})`, fieldType: 'number' },
        { name: 'price', title: 'Ціна', fieldType: 'number' },
    ].map((f) => ({ placeholder: '', ...f, value: f.value ?? '' }));
};

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
