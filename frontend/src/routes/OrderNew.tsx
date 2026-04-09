import React, { useEffect, useMemo, useState } from 'react';
import {
    Formik,
    Form,
    Field,
    FieldArray,
    type FormikHelpers,
    ErrorMessage,
    useField,
    useFormikContext,
    type FieldHookConfig,
} from 'formik';
import {
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    FormHelperText,
    Paper,
    CircularProgress,
    Stack,
    Box,
    Skeleton,
    TextField,
    AppBar,
    Button,
    Toolbar,
    Backdrop,
    Typography,
    dividerClasses,
} from '@mui/material';
import { cartService, clientService, orderService, productService } from '../../../backend';
import { useNotification } from '../components/NotificationContext';
import type { ClientViewDTO } from '../../../dto/ClientViewDTO';
import { Categories } from '../components/Categories';
import type { ProductCategory } from '../../../backend/domain/product/ProductCategory';
import type { ProductViewDTO } from '../../../dto/ProductViewDTO';
import { priceFormat } from '../../../utils/utils';
import * as Yup from 'yup';
import { useParams, useSearchParams } from 'react-router';
import type { CartViewDTO } from '../../../dto/CartViewDTO';
import { ProductSelect } from '../components/Order';

export interface OrderFormValues {
    client: number;
    totalAmount: number;
    list: { categoryName: ProductCategory; id: number; weight: number; stock: number }[];
}

export default function OrderNew() {
    const [clients, setClients] = useState<ClientViewDTO[]>([]);
    const [client, setClient] = useState<ClientViewDTO['id']>();
    const [categories, setCategories] = useState<{ name: ProductCategory; title: string }[]>([]);
    const [isLoading, setLoading] = useState<boolean>(false);
    const [cart, setCart] = useState<CartViewDTO>();
    const [state, setState] = useState<Map<ProductCategory, ProductViewDTO[]>>(new Map());
    const [list, setList] = useState<OrderFormValues['list']>([]);
    const [productsInCart, setProductsInCart] = useState<number[]>([]);

    const { notify } = useNotification();
    const isProductInCart = (productId: number) => productsInCart.includes(productId);

    const [searchParams] = useSearchParams();
    const clientId = searchParams.get('clientId');
    const { id } = useParams(); // order ID

    const getProductsByCategory = (categoryName: ProductCategory) => {
        if (state?.has(categoryName)) return state.get(categoryName);
        else
            return productService
                .getProducts(categoryName)
                .then((products) => {
                    setState((prev) => {
                        const newMap = new Map(prev);
                        if (newMap.has(categoryName)) return prev;
                        else {
                            newMap.set(categoryName, products);
                            return newMap;
                        }
                    });

                    return state.get(categoryName);
                })
                .catch((e) => {
                    console.log(e);
                    notify({ message: 'Помилка отримання продуктів', severity: 'error' });
                });
    };

    !!id &&
        useEffect(() => {
            orderService.getById(Number(id)).then((order) => {
                console.log('GET ORDER by ID', id);
            });
        }, []);

    useEffect(() => {
        cartService.getCartToView().then((data) => {
            console.log('getCartToView', data);

            setCart(data);
            // setClient(data.clientId);

            const products = data.products;

            if (products.length) {
                setProductsInCart(products.map(({ id }) => id));
                setList(
                    products.map((i) => ({
                        categoryName: i.categoryName,
                        id: i.id,
                        weight: i.weight,
                        stock: i.stock,
                    })),
                );
            }
        });
    }, []);

    useEffect(() => {
        if (!!clientId) {
            clientService
                .getById(+clientId)
                .then((list) => {
                    setClients([list]);
                    setClient(list.id);
                })
                .catch((e) => {
                    console.error(e);
                    notify({ message: 'Помилка отримання списку', severity: 'error' });
                });
        } else
            clientService
                .getAll()
                .then((list) => {
                    setClients(list);
                })
                .catch((e) => {
                    console.error(e);
                    notify({ message: 'Помилка отримання списку', severity: 'error' });
                });
    }, []);

    useEffect(() => {
        setLoading(true);

        productService
            .getCategories()
            .then((categories) => {
                setCategories(categories);
                setLoading(false);
            })
            .catch(() => {
                notify({ message: 'Помилка отримання категорій', severity: 'error' });
                setLoading(false);
            });
    }, [client]);

    useEffect(() => {
        console.log('STATE', state);
    }, [state]);

    const calc = (prodictId: number, value: number) => {
        return productService.calculate(prodictId, value);
    };

    const initialValues: OrderFormValues = {
        client: (!!clientId && +clientId) || cart?.clientId || 0,
        totalAmount: cart?.totalAmount ?? 0,
        list: list,
    };

    const validationSchema = useMemo(() => {
        const listItem = Yup.object().shape({
            categoryName: Yup.string().required("Поле обов'язкове"),
            id: Yup.number().required("Поле обов'язкове"),
            stock: Yup.number().required("Поле обов'язкове"),
            weight: Yup.number()
                .transform((value, originalValue) => {
                    return originalValue === '' ? undefined : Number(originalValue);
                })
                .positive('Позитивне значення')
                .max(Yup.ref('stock'), 'Завелике значення')
                .required("Поле обов'язкове"),
        });

        return Yup.object().shape({
            client: Yup.string().required("Поле обов'язкове"),
            totalAmount: Yup.number().positive('Позитивне значення').required("Поле обов'язкове"),
            list: Yup.array().of(listItem).min(1, 'Позитивне значення').required("Поле обов'язкове"),
        });
    }, [list]);

    const isClientSelected = () => clientId !== null || !!cart?.clientId;

    const addCartItem = (data: { productId: number; quantity: number; clientId: number }) => {
        console.warn('addCartItem');
        cartService
            .addCartItem(data)
            .then((data) => {
                console.log('ADD CART ITEM', data);

                setProductsInCart(data.products.map((i) => i.id));

                setCart(data);
                // setClient(data.clientId);

                const products = data.products;

                if (products.length) {
                    setProductsInCart(products.map(({ id }) => id));
                    setList(
                        products.map((i) => ({
                            categoryName: i.categoryName,
                            id: i.id,
                            weight: i.weight,
                            stock: i.stock,
                        })),
                    );
                }

                notify({
                    message: 'Товар додано в корзину',
                    severity: 'success',
                });
            })
            .catch((error) => {
                notify({
                    message: `Помилка додавання товару: ${error.message}`,
                    severity: 'error',
                });
            })
            .finally(() => {
                // setSubmitting(false);
            });
    };

    const deleteCartItem = (id: number) => {
        console.warn('deleteCartItem');
        cartService
            .deleteCartItem(id)
            .then((data) => {
                setProductsInCart(data.products.map((i) => i.id));

                setCart(data);
                // setClient(data.clientId);

                const products = data.products;

                if (products.length) {
                    setProductsInCart(products.map(({ id }) => id));
                    setList(
                        products.map((i) => ({
                            categoryName: i.categoryName,
                            id: i.id,
                            weight: i.weight,
                            stock: i.stock,
                        })),
                    );
                }

                notify({
                    message: 'Товар видалено з корзини',
                    severity: 'success',
                });
            })
            .catch((error) => {
                notify({
                    message: `Помилка видалення з корзини: ${error.message}`,
                    severity: 'error',
                });
            })
            .finally(() => {
                // setSubmitting(false);
            });
    };

    const CategoriesComponent = ({
        onChange,
        ...props
    }: { onChange: (e: React.ChangeEvent<any>) => void } & FieldHookConfig<string>) => {
        const [field, meta, helpers] = useField(props);

        const handleChange = (e: React.ChangeEvent<any>) => {
            const categoryName = e.target.value;

            getProductsByCategory(categoryName);

            helpers.setValue(categoryName);
        };

        return (
            <Categories
                categories={categories}
                value={!!field.value ? field.value : ''}
                onChange={(e) => {
                    handleChange(e);
                    onChange(e);
                }}
                {...props}
                name={field.name}
            />
        );
    };

    const SelectedProductList = () => {
        const { values, isValid, handleChange, errors, setFieldValue } = useFormikContext<OrderFormValues>();
        const { list, client } = values;
        console.log(errors);

        const ItemNotFound = () => (
            <Typography
                justifyContent={'center'}
                height={56}
                variant="h6"
                sx={{ display: 'flex', alignItems: 'center' }}
            >
                Не знайдено продуктів
            </Typography>
        );

        const emptyItem = {
            categoryName: '',
            id: '',
            weight: 0,
            stock: 0,
        };

        return (
            <FieldArray
                name="list"
                render={(arrayHelpers) => (
                    <Box>
                        {list.length > 0 &&
                            list.map((item, index) => {
                                const cartProduct = cart?.products.find((p) => p.id === item.id);

                                const _products = !!cartProduct ? [cartProduct] : state.get(item.categoryName);
                                const categoryHasProducts = !!_products?.length;
                                const productInCart = isProductInCart(item.id);

                                return (    
                                    <Paper key={index} sx={{ p: 2, my: 2 }} elevation={3}>
                                        <CategoriesComponent
                                            name={`list.${index}.categoryName`}
                                            onChange={(e: React.ChangeEvent<any>) => {
                                                handleChange(e.target.value);
                                                arrayHelpers.replace(index, {
                                                    ...emptyItem,
                                                    categoryName: e.target.value,
                                                });
                                            }}
                                            disabled={productInCart}
                                        />

                                        {!!item.categoryName &&
                                            (categoryHasProducts ? (
                                                <ProductSelect
                                                    label={'Список продуктів'}
                                                    products={_products ?? []}
                                                    name={`list.${index}.id`}
                                                    onChange={handleChange}
                                                    disabled={productInCart}
                                                    addCartItem={addCartItem}
                                                    deleteCartItem={deleteCartItem}
                                                    calcAmount={calc}
                                                    client={values.client}
                                                    index={index}
                                                    productsInCart={productsInCart}
                                                />
                                            ) : (
                                                <ItemNotFound />
                                            ))}
                                    </Paper>
                                );
                            })}

                        <Stack direction={'row'} p={2} spacing={1}>
                            <Button
                                size={'small'}
                                variant="outlined"
                                fullWidth
                                onClick={() => {
                                    arrayHelpers.push(emptyItem);
                                }}
                            >
                                Додати товарну позицію
                            </Button>
                        </Stack>
                    </Box>
                )}
            />
        );
    };

    return (
        <Paper elevation={12} sx={{ p: 2, mb: 3 }}>
            <Formik
                initialValues={initialValues}
                validateOnBlur={false}
                onSubmit={(
                    values: OrderFormValues,
                    { setSubmitting, setFieldValue, resetForm }: FormikHelpers<OrderFormValues>,
                ) => {
                    setSubmitting(false);
                }}
                validationSchema={validationSchema}
                enableReinitialize={true}
            >
                {({
                    errors,
                    touched,
                    isValidating,
                    values,
                    setFieldValue,
                    isSubmitting,
                    setSubmitting,
                    handleChange,
                    isValid,
                }) => {
                    console.log('INIT', values);
                    return (
                        <Form>
                            <FormControl fullWidth margin="dense">
                                <InputLabel id={`clientList`}>Список клієнтів</InputLabel>
                                <Select
                                    disabled={isClientSelected()}
                                    aria-labelledby={`clientList`}
                                    id={`clientList`}
                                    label={`clientList`}
                                    name="client"
                                    value={values.client ? values.client : ''}
                                    onChange={handleChange}
                                    error={!!errors.client}
                                >
                                    {clients.map((item, itemIdx) => (
                                        <MenuItem key={itemIdx} value={item.id} sx={{ textTransform: 'capitalize' }}>
                                            {item.name}
                                        </MenuItem>
                                    ))}
                                </Select>

                                <FormHelperText error={!!errors.client}>{errors.client}</FormHelperText>
                            </FormControl>

                            {!!values.client && <SelectedProductList />}

                            <AppBar position="fixed" color="primary" sx={{ top: 'auto', bottom: 0 }}>
                                <Toolbar>
                                    <Button
                                        variant="outlined"
                                        sx={{ color: 'white', borderColor: 'white' }}
                                        fullWidth
                                        href={'/cart'}
                                        disabled={values.totalAmount === 0}
                                    >
                                        Перейти в Корзину | Сума:&nbsp;
                                        <b>{priceFormat(values.totalAmount)}</b>
                                    </Button>
                                </Toolbar>
                            </AppBar>

                            <Backdrop
                                sx={(theme: any) => ({ color: '#fff', zIndex: theme.zIndex.drawer + 1 })}
                                open={isSubmitting}
                            >
                                <CircularProgress color="inherit" />
                            </Backdrop>
                        </Form>
                    );
                }}
            </Formik>
        </Paper>
    );
}
