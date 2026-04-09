import { useNavigate } from 'react-router';
import { useEffect, useState } from 'react';
import { Box, Button, CardActions, Paper, Stack, Typography } from '@mui/material';
import { cartService, orderService } from '../../../backend';
import { priceFormat } from '../../../utils/utils';
import { ProductCard } from '../components/Product/ProductCard';
import { useNotification } from '../components/NotificationContext';
import type { CartViewDTO } from '../../../dto/CartViewDTO';

export default function Cart() {
    const [cart, setCart] = useState<CartViewDTO>();

    const navigate = useNavigate();
    const { notify } = useNotification();

    const deleteCartItem = (itemId: number) => {
        cartService.deleteCartItem(itemId).then((cart) => {
            setCart(cart);
            notify({ message: 'Товар видалено з корзини', severity: 'success' });
        });
    };

    const deleteCart = () => {
        cartService.deleteCart().then(() => {
            setCart(undefined);
        });
    };

    const createOrder = () => {
        orderService
            .createOrder()
            .then((orderId) => {
                navigate(`/orders/${orderId}`);
                notify({ message: 'Замовлення успішно створено', severity: 'success' });
            })
            .catch((error) => {
                console.log(error);
                notify({ message: `Помилка створення замовлення: ${error.message}`, severity: 'error' });
            });
    };

    useEffect(() => {
        cartService.getCartToView().then((cart) => {
            setCart(cart);
        });
    }, []);

    return (
        <Box>
            {!!cart && cart.quantity > 0 ? (
                <Box>
                    {!!cart.client && (
                        <Paper sx={{ mt: 2, p: 2 }}>
                            <Typography>{cart.client.name}</Typography>
                            <Typography>{cart.client.phone}</Typography>
                        </Paper>
                    )}

                    {cart.products.map((product, idx) => (
                        <ProductCard
                            key={idx}
                            product={product}
                            children={
                                <CardActions sx={{ p: 2 }}>
                                    <Button
                                        variant="outlined"
                                        color="error"
                                        fullWidth
                                        type={'submit'}
                                        onClick={() => {
                                            deleteCartItem(product.id);
                                        }}
                                    >
                                        Видалити з корзини
                                    </Button>
                                </CardActions>
                            }
                        />
                    ))}

                    <Paper sx={{ mt: 2, p: 2 }}>
                        <Typography textAlign={'center'} gutterBottom>
                            Загальна вартість : <b>{priceFormat(cart.totalAmount)}</b>
                        </Typography>

                        <Stack spacing={2}>
                            <Button
                                variant="contained"
                                fullWidth
                                type={'submit'}
                                onClick={() => {
                                    createOrder();
                                }}
                            >
                                Створити Замовлення
                            </Button>

                            <Button variant="outlined" color="info" fullWidth href="/orders/new">
                                Додати товар
                            </Button>

                            <Button
                                variant="outlined"
                                color="error"
                                fullWidth
                                type={'submit'}
                                onClick={() => {
                                    deleteCart();
                                }}
                            >
                                Видалити Корзину
                            </Button>
                        </Stack>
                    </Paper>
                </Box>
            ) : (
                <Stack spacing={2} justifyContent={'center'}>
                    <Typography variant="h5" textAlign={'center'}>
                        Корзина порожня
                    </Typography>

                    <Button href="/orders/new" variant="outlined">
                        Нове Замовлення
                    </Button>
                </Stack>
            )}
        </Box>
    );
}
