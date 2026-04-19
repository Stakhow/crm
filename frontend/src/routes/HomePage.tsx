import { useEffect } from 'react';
import { Dayjs } from 'dayjs';
import { Backdrop, Box, Card, CircularProgress, Divider } from '@mui/material';
import { OrderItem } from '../components/Order/OrderItem';
import { CalendarWithState } from '../components/Calendar';
import { OrdersNotFound } from '../components/Order/OrdersNotFound';
import { BottomBar } from '../components/BottomBar';
import { calendarStore } from '../../store/CalendarStore';
import { orderStore } from '../../store';
import { InitOrderButton } from '../components/Order/OrderButtons';

export default function HomePage() {
    const { monthOrders, orders, getOrdersByMonth, getOrdersByTargetDate, isLoading } = orderStore((s) => s);
    const { date, setDate } = calendarStore((s) => s);

    useEffect(() => {
        getOrdersByMonth(date);
    }, []);

    useEffect(() => {
        if (date) getOrdersByTargetDate(date);
    }, [date]);

    return (
        <Box sx={{ p: 2 }}>
            <Card raised>
                <CalendarWithState
                    isLoading={isLoading}
                    onChange={(e: Dayjs) => {
                        setDate(e);
                    }}
                    onMonthChange={(newMonth: Dayjs) => {
                        getOrdersByMonth(newMonth);
                    }}
                    monthOrders={monthOrders}
                    value={date}
                />
            </Card>

            <Divider sx={{ my: 1, borderColor: 'transparent' }} />

            {!!orders && !!orders.length ? (
                <Box mt={2} mb={8}>
                    {orders.map((i) => (
                        <OrderItem key={i.id} order={i} />
                    ))}
                </Box>
            ) : (
                <OrdersNotFound buttonText="" />
            )}

            <BottomBar>
                <InitOrderButton />
            </BottomBar>

            <Backdrop sx={(theme: any) => ({ color: '#fff', zIndex: theme.zIndex.drawer + 1 })} open={false}>
                <CircularProgress color="inherit" />
            </Backdrop>
        </Box>
    );
}
