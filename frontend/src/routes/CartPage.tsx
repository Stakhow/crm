import { useNavigate } from 'react-router';
import { Backdrop, Box, Card, CircularProgress, Skeleton, Stack } from '@mui/material';
import { cartStore, calendarStore, orderStore, clientStore } from '../../store';
import { CalendarInputState } from '../components/Calendar';
import { BottomBar } from '../components/BottomBar';
import { ComponentNotFound } from '../components/ComponentNotFound';
import { OrderTotalAmount } from '../components/Order/OrderTotalAmount';
import { CartDeleteButton, ToOrderProcessButton } from '../components/Cart/CartButtons';
import { CreateOrderButton } from '../components/Order/OrderButtons';
import { useEffect } from 'react';
import { CartList } from '../components/Cart/CartList';
import { ClientItem } from '../components/Client/ClientItem';

export default function CartPage() {
    const { cart, isLoading, clientId, getCartToView } = cartStore((state) => state);
    const { order } = orderStore((s) => s);
    const { date } = calendarStore((s) => s);
    const { client, getClient } = clientStore((s) => s);

    const navigate = useNavigate();

    useEffect(() => {
        getCartToView();
    }, []);

    useEffect(() => {
        if (!!clientId) getClient(clientId);
    }, [clientId]);

    useEffect(() => {
        if (!!order && !!order.id) navigate(`/orders/${order.id}`);
    }, [order]);

    return (
        <Box>
            {!isLoading && (
                <>
                    {!!cart && cart.quantity > 0 ? (
                        <Box>
                            {!!client ? <ClientItem client={client} /> : <Skeleton height={86} />}

                            <CartList />

                            <Card sx={{ mt: 2, p: 2, mb: 14 }} raised>
                                <Stack spacing={2}>
                                    <ToOrderProcessButton />

                                    <CartDeleteButton />

                                    <CalendarInputState label="Виконати на" error={!date} disablePast />
                                </Stack>
                            </Card>

                            <BottomBar>
                                <OrderTotalAmount totalAmount={cart.totalAmount} />

                                <CreateOrderButton />
                            </BottomBar>
                        </Box>
                    ) : (
                        <ComponentNotFound
                            title={'Корзина порожня'}
                            buttonText={'Нове Замовлення'}
                            link={'/orders/new'}
                        />
                    )}
                </>
            )}

            <Backdrop sx={(theme: any) => ({ color: '#fff', zIndex: theme.zIndex.drawer + 1 })} open={isLoading}>
                <CircularProgress color="inherit" />
            </Backdrop>
        </Box>
    );
}
