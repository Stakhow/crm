import { Button } from '@mui/material';
import { cartStore, orderStore } from '../../../store';
import { calendarStore } from '../../../store/CalendarStore';
import { NavLink, useLocation } from 'react-router';

export const CreateOrderButton = () => {
    const { isLoading, createOrder } = orderStore((s) => s);
    const { cart } = cartStore((s) => s);
    const { date } = calendarStore((s) => s);

    const { pathname } = useLocation();

    const isCartPage = pathname === '/cart';

    return (
        <Button
            size={'large'}
            variant="contained"
            fullWidth
            disabled={isLoading || !date}
            onClick={() => createOrder(date)}
        >
            {/* {!!cart && !!cart.items.length ? 'Продовжити' : 'Створити'} замовлення */}
            {isCartPage ? 'Створити' : !!cart && !!cart.items.length ? 'Продовжити' : 'Створити'} замовлення
        </Button>
    );
};

export const RepeatOrderButton = ({ orderId }: { orderId: number }) => {
    const { repeatOrder, isLoading } = orderStore((s) => s);

    return (
        <Button size={'large'} fullWidth disabled={isLoading} variant="contained" onClick={() => repeatOrder(orderId)}>
            Повторити замовлення
        </Button>
    );
};

export const InitOrderButton = () => (
    <Button size={'large'} variant="contained" fullWidth component={NavLink} to={'/orders/new'}>
        Створити Замовлення
    </Button>
);
