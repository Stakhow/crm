import { useEffect, useState } from 'react';
import dayjs, { Dayjs } from 'dayjs';
import { Backdrop, Box, CircularProgress, Paper, Typography } from '@mui/material';
import type { PickerValue } from '@mui/x-date-pickers/internals';
import updateLocale from 'dayjs/plugin/updateLocale';
import { orderService } from '../../../backend';
import type { OrderViewDTO } from '../../../dto/OrderViewDTO';
import { OrderItem } from '../components/OrderItem';
import { Calendar } from '../components/Calendar';

dayjs.extend(updateLocale);
dayjs.updateLocale('en', {
    weekStart: 1,
});

export default function Home() {
    const [isLoading, setIsLoading] = useState(false);
    const [date, setDate] = useState<PickerValue>(dayjs());
    const [monthOrders, setMonthOrders] = useState<Map<number, OrderViewDTO[]>>();
    const [orders, setOrders] = useState<OrderViewDTO[]>([]);

    const getOrdersByMonth = (date: PickerValue) => {
        if (date) {
            setIsLoading(true);

            const timestamp = date.valueOf();

            orderService.getOrdersByMonth(timestamp).then((orders) => {
                setMonthOrders(orders);
                setOrders(orders.get(date.date()) ?? []);

                setIsLoading(false);
            });
        }
    };

    useEffect(() => {
        if (date) getOrdersByMonth(date);
    }, [date]);

    const handleMonthChange = (date: Dayjs) => {
        getOrdersByMonth(date);
    };

    return (
        <Paper sx={{ p: 2 }}>
            <Calendar
                date={date}
                setDate={setDate}
                isLoading={isLoading}
                handleMonthChange={handleMonthChange}
                monthOrders={monthOrders}
                onChange={(newValue: PickerValue) => setDate(newValue)}
                onMonthChange={handleMonthChange}
            />

            <Box mt={2}>
                {!!orders.length ? (
                    orders.map((i) => <OrderItem key={i.id} order={i} />)
                ) : (
                    <Typography textAlign={'center'} variant="h5" component={'h1'}>
                        Немає замовлень
                    </Typography>
                )}
            </Box>

            <Backdrop sx={(theme: any) => ({ color: '#fff', zIndex: theme.zIndex.drawer + 1 })} open={isLoading}>
                <CircularProgress color="inherit" />
            </Backdrop>
        </Paper>
    );
}
