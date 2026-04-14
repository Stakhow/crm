import { useEffect, useState } from 'react';
import { orderService } from '../../../backend';
import { Box, Typography } from '@mui/material';
import type { OrderViewDTO } from '../../../dto/OrderViewDTO';
import { OrderItem } from '../components/OrderItem';

export default function OrdersPage() {
    const [orders, setOrders] = useState<OrderViewDTO[]>();

    useEffect(() => {
        orderService.getAll().then((orders) => setOrders(orders));
    }, []);

    return (
        <Box>
            {!!orders && !!orders.length ? (
                orders.map((i) => <OrderItem key={i.id} order={i} />)
            ) : (
                <Typography textAlign={'center'} variant="h5" component={'h1'}>
                    Немає замовлень
                </Typography>
            )}
        </Box>
    );
}
