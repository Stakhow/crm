import { useLocation, useParams, useNavigate } from 'react-router';
import { useEffect, useState } from 'react';
import { Box, Button, CardActions, Divider, Fab, Paper, Stack, Typography } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { cartService, clientService, orderService } from '../../../backend';
import type { CartDTO } from '../../../dto/CartDTO';
import type { ClientViewDTO } from '../../../dto/ClientViewDTO';
import { priceFormat } from '../../../utils/utils';
import { ProductCard } from '../components/Product/ProductCard';
import type { ProductViewDTO } from '../../../dto/ProductViewDTO';
import { useNotification } from '../components/NotificationContext';

export default function Cart() {
    const [cart, setCart] = useState<
        CartDTO & {
            products: ProductViewDTO[];
        }
    >();
    const [client, setClient] = useState<ClientViewDTO>();

    const navigate = useNavigate();
    const { notify } = useNotification();

    const getCartInfo = () => {
        cartService.getCartToView().then((cart) => {
            if (cart.clientId)
                clientService.getById(cart.clientId).then((client) => {
                    setClient(client);
                    setCart(cart);
                    console.log(cart);
                });
            else {
                setCart(undefined);
                setClient(undefined);
            }
        });
    };

    useEffect(() => {
        getCartInfo();
    }, []);

    return (
        <Box>
            {!!cart && !!client ? (
                <Box>
                    <Paper sx={{ mt: 2, p: 2 }}>
                        <Typography>{client.name}</Typography>
                        <Typography>{client.phone}</Typography>
                    </Paper>

                    {!!cart.products.length &&
                        cart.products.map((product, idx) => (
                            <ProductCard
                                key={idx}
                                product={product}
                                children={
                                    <CardActions sx={{ p: 2 }}>
                                        <Stack direction="row" justifyContent={'center'} flex={1}>
                                            <Button
                                                variant="outlined"
                                                color="error"
                                                fullWidth
                                                type={'submit'}
                                                onClick={() => {
                                                    cartService.deleteCartItem(product.id).then(() => getCartInfo());
                                                }}
                                            >
                                                Видалити з корзини
                                            </Button>
                                        </Stack>
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
                                variant="outlined"
                                fullWidth
                                type={'submit'}
                                onClick={() => {
                                    orderService
                                        .createOrder()
                                        .then((orderId) => {

                                            navigate(`/orders/${orderId}`);
                                            notify({ message: 'Замовлення успішно створено', severity: 'success' });
                                        })
                                        .catch(() => {
                                            notify({ message: 'Помилка створення замовлення', severity: 'error' });
                                        });
                                }}
                            >
                                Створити Замовлення
                            </Button>

                            <Button
                                variant="outlined"
                                color="error"
                                fullWidth
                                type={'submit'}
                                onClick={() => {
                                    cartService.deleteCart().then(() => {
                                        setCart(undefined);
                                        setClient(undefined);
                                    });
                                }}
                            >
                                Видалити Корзину
                            </Button>
                        </Stack>
                    </Paper>
                </Box>
            ) : (
                'Корзина Порожня'
            )}
        </Box>
    );
}
