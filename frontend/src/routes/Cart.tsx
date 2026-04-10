import { useNavigate } from 'react-router';
import { useEffect, useState } from 'react';
import {
    AppBar,
    Box,
    Button,
    CardActions,
    FormControl,
    Paper,
    Stack,
    TextField,
    Toolbar,
    Typography,
} from '@mui/material';
import { cartService, orderService } from '../../../backend';
import { priceFormat } from '../../../utils/utils';
import { ProductCard } from '../components/Product/ProductCard';
import { useNotification } from '../components/NotificationContext';
import type { CartViewDTO } from '../../../dto/CartViewDTO';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

export default function Cart() {
    const [cart, setCart] = useState<CartViewDTO>();
    const [deadline, setDeadline] = useState<number>(0);

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
        if (!!deadline)
            orderService
                .createOrder(deadline)
                .then((orderId) => {
                    navigate(`/orders/${orderId}`);
                    notify({ message: 'Замовлення успішно створено', severity: 'success' });
                })
                .catch((error) => {
                    console.log(error);
                    notify({ message: `Помилка створення замовлення: ${error.message}`, severity: 'error' });
                });
        else notify({ message: 'Помилка створення замовлення: Дата виконання не встановлена', severity: 'success' });
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
                        <Stack spacing={2}>
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

                            <FormControl fullWidth margin="dense">
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <DemoContainer components={['DatePicker']}>
                                        <DatePicker
                                            label="Виконати на"
                                            disablePast
                                            format="DD/MM/YYYY"
                                            onChange={(val) => {
                                                setDeadline(val ? val.valueOf() : 0);

                                                return val;
                                            }}
                                        />
                                    </DemoContainer>
                                </LocalizationProvider>
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

                    <Button href="/orders/new" variant="outlined">
                        Нове Замовлення
                    </Button>
                </Stack>
            )}
        </Box>
    );
}
