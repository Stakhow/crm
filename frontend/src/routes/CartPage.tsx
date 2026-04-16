import { NavLink, useNavigate } from 'react-router';
import { useState } from 'react';
import { AppBar, Box, Button, CardActions, FormControl, Paper, Stack, Toolbar, Typography } from '@mui/material';
import { orderService } from '../../../backend';
import { priceFormat } from '../../../utils/utils';
import { ProductCard } from '../components/Product/ProductCard';
import { useNotification } from '../components/NotificationContext';
import { cartStore } from '../../store';
import { CalendarInput } from '../components/Calendar';
import type { PickerValue } from '@mui/x-date-pickers/internals';

export default function CartPage() {
    const [deadline, setDeadline] = useState<PickerValue | null>(null);

    const cart = cartStore((state) => state.data);
    const deleteCartItem = cartStore((state) => state.deleteCartItem);
    const deleteCart = cartStore((state) => state.deleteCart);
    const getCartToView = cartStore((state) => state.getCartToView);

    const navigate = useNavigate();
    const { notify } = useNotification();

    const createOrder = () => {
        if (!!deadline)
            orderService
                .createOrder(deadline.valueOf())
                .then((orderId) => {
                    getCartToView();
                    navigate(`/orders/${orderId}`);
                    notify({ message: 'Замовлення успішно створено', severity: 'success' });
                })
                .catch((error) => {
                    console.log(error);
                    notify({ message: `Помилка створення замовлення: ${error.message}`, severity: 'error' });
                });
        else notify({ message: 'Помилка створення замовлення: Дата виконання не встановлена', severity: 'success' });
    };

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
                            isInCart={true}
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

                    <Paper sx={{ mt: 2, p: 2, mb: 14 }}>
                        <Stack spacing={2}>
                            <Button variant="outlined" color="info" fullWidth to={'/orders/new'} component={NavLink}>
                                Додати товар
                            </Button>

                            <Button
                                size={'large'}
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

                            <FormControl fullWidth margin="dense">
                                <CalendarInput
                                    value={deadline}
                                    label="Виконати на"
                                    onChange={(val: PickerValue) => {
                                        if (val) setDeadline(val);

                                        return val;
                                    }}
                                    error={!deadline}
                                    disablePast
                                />
                            </FormControl>
                            <FormControl fullWidth margin="dense">
                                {/* <Test /> */}
                            </FormControl>
                        </Stack>
                    </Paper>

                    <AppBar position="fixed" color="default" sx={{ top: 'auto', bottom: 0, py: 1 }}>
                        <Toolbar>
                            <Stack spacing={1} direction={'column'} sx={{ width: '100%' }}>
                                <Typography textAlign={'center'} gutterBottom variant="h6">
                                    Загальна вартість : <b>{priceFormat(cart.totalAmount)}</b>
                                </Typography>

                                <Button
                                    size={'large'}
                                    variant="contained"
                                    fullWidth
                                    disabled={!deadline}
                                    onClick={() => {
                                        createOrder();
                                    }}
                                >
                                    Створити Замовлення
                                </Button>
                            </Stack>
                        </Toolbar>
                    </AppBar>
                </Box>
            ) : (
                <Stack spacing={2} justifyContent={'center'}>
                    <Typography variant="h5" textAlign={'center'}>
                        Корзина порожня
                    </Typography>

                    <Button size={'large'} end to={'/orders/new'} component={NavLink} variant="outlined">
                        Нове Замовлення
                    </Button>
                </Stack>
            )}
        </Box>
    );
}
