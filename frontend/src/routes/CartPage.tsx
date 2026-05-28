import { Backdrop, Box, Card, CircularProgress, Stack } from '@mui/material';
import { CalendarInputState } from '../components/Calendar';
import { BottomBar } from '../components/BottomBar';
import { ComponentNotFound } from '../components/ComponentNotFound';
import { OrderTotalAmount } from '../components/Order/OrderTotalAmount';
import { CartDeleteButton, ToOrderProcessButton } from '../components/Cart/CartButtons';
import { CreateOrderButton } from '../components/Order/OrderButtons';
import { useEffect } from 'react';
import { CartList } from '../components/Cart/CartList';
import { ClientsListSelect } from '../components/Client/ClientsListSelect';
import { cartStore, calendarStore, orderStore } from '../../store';

export default function CartPage() {
    const { cart, isLoading, getCartToView } = cartStore((s) => s);
    const { setDueDate } = orderStore((s) => s);
    const { date } = calendarStore((s) => s);

    useEffect(() => {
        getCartToView();
    }, []);

    useEffect(() => {
        if (!!date) setDueDate(date);
    }, [date]);

    return (
        <Box>
            {!isLoading && (
                <>
                    {!!cart && cart.quantity > 0 ? (
                        <Box>
                            <CartList />

                            <Card sx={{ mt: 2, p: 2, mb: 14 }} raised>
                                <Stack spacing={2}>
                                    <ToOrderProcessButton />

                                    <CartDeleteButton />

                                    <CalendarInputState label="Виконати на" error={!date} disablePast />

                                    <ClientsListSelect />
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
