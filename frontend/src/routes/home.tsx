import { useEffect, useState } from 'react';
import dayjs, { Dayjs } from 'dayjs';
import Badge from '@mui/material/Badge';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { PickerDay, type PickerDayProps } from '@mui/x-date-pickers/PickerDay';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { DayCalendarSkeleton } from '@mui/x-date-pickers/DayCalendarSkeleton';
import { Backdrop, Box, CircularProgress, Paper, Typography } from '@mui/material';
import type { PickerValue } from '@mui/x-date-pickers/internals';
import updateLocale from 'dayjs/plugin/updateLocale';
import { orderService } from '../../../backend';
import type { OrderViewDTO } from '../../../dto/OrderViewDTO';
import { OrderItem } from '../components/OrderItem';
import type { ButtonProps } from '@mui/material';
import { grey } from '@mui/material/colors';

dayjs.extend(updateLocale);
dayjs.updateLocale('en', {
    weekStart: 1,
});

function ServerDay(props: PickerDayProps & { monthOrders: Map<number, OrderViewDTO[]> }) {
    const { day, outsideCurrentMonth, ...other } = props;

    const orders = props.monthOrders ? props.monthOrders.get(day.date()) : undefined;
    const isPast = day.isBefore(dayjs(), 'day');

    let color: ButtonProps['color'] = 'info';

    if (orders) {
        if (orders.some((i) => i.status === 'InProgress')) color = 'error';
        if (orders.every((i) => i.status === 'Done')) color = 'success';
    }

    return (
        <Badge
            key={props.day.toString()}
            overlap="circular"
            color={isPast ? 'info' : color}
            badgeContent={orders ? orders.length : undefined}
            sx={{
                '& .MuiBadge-colorInfo': {
                    backgroundColor: grey[500],
                },
            }}
        >
            <PickerDay {...other} outsideCurrentMonth={outsideCurrentMonth} day={day} />
        </Badge>
    );
}

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
            <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DateCalendar
                    value={date}
                    defaultValue={date}
                    loading={isLoading}
                    onMonthChange={handleMonthChange}
                    dayOfWeekFormatter={(weekday) => `${weekday.format('dd')}.`}
                    renderLoading={() => <DayCalendarSkeleton />}
                    onChange={(newValue) => setDate(newValue)}
                    sx={{
                        width: '100%',
                        maxWidth: '400px',
                        '& .MuiDayCalendar-slideTransition': {
                            minHeight: '400px',
                        },
                        '& .MuiDayCalendar-weekDayLabel': {
                            fontSize: '1rem',
                        },
                    }}
                    slots={{
                        day: ServerDay as any,
                    }}
                    slotProps={{
                        day: {
                            monthOrders,
                            sx: {
                                width: '42px',
                                height: '42px',
                                fontSize: '1rem',
                            },
                        } as any,
                    }}
                />
            </LocalizationProvider>

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
