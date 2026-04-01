import React, { useEffect, useMemo, useState } from 'react';
import { Formik, Form, Field } from 'formik';
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
} from '@mui/material';
import { cartService, clientService, orderService, productService } from '../../../backend';
import { useNotification } from '../components/NotificationContext';
import type { ClientViewDTO } from '../../../dto/ClientViewDTO';
import { Categories } from '../components/Categories';
import type { ProductCategory } from '../../../backend/domain/product/ProductCategory';
import type { ProductViewDTO } from '../../../dto/ProductViewDTO';
import { ProductCard } from '../components/Product/ProductCard';
import { priceFormat } from '../../../utils/utils';
import * as Yup from 'yup';
import { useParams, useSearchParams } from 'react-router';
import type { OrderViewDTO } from '../../../dto/OrderViewDTO';

export default function OrderNew() {
    const [clients, setClients] = useState<ClientViewDTO[]>([]);
    const [client, setClient] = useState<ClientViewDTO>();
    const [categoryName, setCategoryName] = useState<ProductCategory | ''>('');
    const [categories, setCategories] = useState<{ name: ProductCategory; title: string }[]>([]);
    const [products, setProducts] = useState<ProductViewDTO[]>([]);
    const [product, setProduct] = useState<ProductViewDTO>();
    const [isLoading, setLoading] = useState<boolean>(false);
    const [isProductLoading, setProductLoading] = useState<boolean>(false);
    const [cart, setCart] = useState<{
        clientId: number;
    }>();

    const [order, setOrder] = useState<OrderViewDTO>();

    const { notify } = useNotification();

    const [searchParams] = useSearchParams();
    const clientId = searchParams.get('clientId');
    const { id } = useParams();

    !!id &&
        useEffect(() => {
            orderService.getById(Number(id)).then((order) => {
                setOrder(order);
                console.log(order);
            });
        }, []);

    useEffect(() => {
        cartService.getCartToView().then((data) => {
            setCart(data);
            !!data.items.length &&
                clientService.getById(data.clientId).then((client) => {
                    setClient(client);
                });
        });
    }, []);

    useEffect(() => {
        if (!!clientId) {
            clientService
                .getById(+clientId)
                .then((list) => {
                    setClients([list]);
                    setClient(list);
                })
                .catch((e) => {
                    console.error(e);
                    notify({ message: 'Помилка отримання списку', severity: 'error' });
                });
        } else
            clientService
                .getAll()
                .then((list) => {
                    console.log('list', list);
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
        setLoading(true);
        setTimeout(() => {
            !!categoryName &&
                productService
                    .getProducts(categoryName)
                    .then((product) => {
                        setProducts(product);
                        console.log('useEffect getProductsByCategory', product);
                        setProductLoading(false);
                    })
                    .catch((e) => {
                        setProductLoading(false);
                        console.log(e);
                        notify({ message: 'Помилка отримання продуктів', severity: 'error' });
                    });
        }, 1000);
    }, [categoryName]);

    const calc = async (value: number, cb: (value: number) => void) => {
        if (!!product) {
            productService.calculate(product.id, value).then(({ sum, isValid }) => {
                cb(isValid ? sum : 0);
            });
        }
    };

    const validationSchema = useMemo(() => {
        const getLimit = (): number => {
            let value = 0;

            if (!!product) {
                if (product.categoryName === 'bag') {
                    const quantity = product.fields.find((i) => i.name === 'quantity');

                    if (!!quantity) value = +quantity.value;
                } else value = product.weight;
            }

            return value;
        };

        return Yup.object().shape({
            param: Yup.number()
                .min(0, 'Позитивне значення')
                .max(getLimit(), 'Завелике значення')
                .required("Поле обов'язкове"),
        });
    }, [product]);

    // const isClientSelected = clientId !== null || !!client?.id;
    const isClientSelected = clientId !== null || !!cart?.clientId;

    return (
        <Paper elevation={12} sx={{ p: 2 }}>
            <Formik
                initialValues={{
                    client: clientId || client?.id || '',
                    categoryName: '',
                    product: '',
                    param: '',
                    totalAmount: 0,
                }}
                onSubmit={(values, { setSubmitting, setFieldValue, resetForm }) => {
                    const productId = +values.product;

                    if (!!client) {
                        cartService
                            .addCartItem({
                                productId,
                                quantity: +values.param,
                                clientId: +values.client,
                            })
                            .then(() => {
                                notify({ message: 'Продукт додано в корзину', severity: 'success' });
                                setFieldValue('totalAmount', 0, false);
                                setFieldValue('param', '');
                                productService.getProductToView(productId).then((product) => {
                                    setProduct(product);
                                });
                            })
                            .catch(() => {
                                notify({ message: 'Помилка додавання в корзину', severity: 'error' });
                            })
                            .finally(() => {
                                setSubmitting(false);
                            });
                    }
                }}
                validationSchema={validationSchema}
                enableReinitialize={true}
            >
                {({ errors, touched, isValidating, values, setFieldValue, isSubmitting, setSubmitting }) => (
                    <Form>
                        <FormControl fullWidth margin="dense">
                            <InputLabel id={`clientList`}>Список клієнтів</InputLabel>
                            <Select
                                disabled={isClientSelected}
                                aria-labelledby={`clientList`}
                                id={`clientList`}
                                label={`clientList`}
                                name="client"
                                value={values.client}
                                onChange={(e) => {
                                    setFieldValue('client', e.target.value);
                                    setClient(clients.find((i) => i.id === +e.target.value));
                                }}
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

                        {!!client && (
                            <Categories
                                categories={categories}
                                value={categoryName}
                                onChange={(e) => {
                                    setCategoryName(e.target.value);
                                    setProductLoading(true);
                                    setFieldValue('product', '');
                                    setProduct(undefined);
                                }}
                            />
                        )}

                        {!!categoryName &&
                            (!isProductLoading ? (
                                !!products.length ? (
                                    <FormControl fullWidth margin="dense">
                                        <InputLabel id={`productList`}>Список продуктів</InputLabel>
                                        <Select
                                            aria-labelledby={`productList`}
                                            id={`productList`}
                                            label={`productList`}
                                            name="product"
                                            value={values.product}
                                            onChange={(e) => {
                                                setFieldValue('product', e.target.value);
                                                setProduct(products.find((i) => i.id === +e.target.value));
                                            }}
                                            error={!!errors.product}
                                        >
                                            {products.map((item, itemIdx) => (
                                                <MenuItem
                                                    key={itemIdx}
                                                    value={item.id}
                                                    sx={{ textTransform: 'capitalize' }}
                                                >
                                                    {item.name} ID:{item.id}
                                                </MenuItem>
                                            ))}
                                        </Select>

                                        <FormHelperText error={!!errors.client}>{errors.client}</FormHelperText>
                                    </FormControl>
                                ) : (
                                    <Box textAlign={'center'}>Не знайдено продуктів для данної категорії</Box>
                                )
                            ) : (
                                <Skeleton sx={{ mt: 1 }} variant="rounded" width={'100%'} height={56} />
                            ))}

                        {!!product && (
                            <ProductCard product={product}>
                                {Number(product.weight) === 0 ? (
                                    <Typography textAlign={'center'} color="error" gutterBottom={true}>
                                        Продукт Закінчився
                                    </Typography>
                                ) : (
                                    <Stack direction={'row'} p={2}>
                                        <FormControl margin="dense" fullWidth>
                                            <Field
                                                id={`param`}
                                                label={categoryName === 'bag' ? 'Кількість' : 'Вага'}
                                                component={TextField}
                                                name="param"
                                                type="number"
                                                value={values.param}
                                                onChange={(e: React.ChangeEvent<any>) => {
                                                    setFieldValue('param', e.target.value);

                                                    setSubmitting(true);

                                                    calc(Number(e.target.value), (val) => {
                                                        setFieldValue('totalAmount', val);
                                                        setSubmitting(false);
                                                    });
                                                }}
                                                onFocus={() => {
                                                    // setFieldValue('param', '', false);
                                                }}
                                                helperText={errors.param}
                                                error={!!errors.param}
                                            />
                                        </FormControl>
                                    </Stack>
                                )}
                            </ProductCard>
                        )}

                        <AppBar position="fixed" color="primary" sx={{ top: 'auto', bottom: 0 }}>
                            <Toolbar>
                                <Button
                                    variant="outlined"
                                    sx={{ color: 'white', borderColor: 'white' }}
                                    fullWidth
                                    type={'submit'}
                                    disabled={!product}
                                >
                                    Додати в Корзину | Сума:&nbsp;
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
                )}
            </Formik>
        </Paper>
    );
}
