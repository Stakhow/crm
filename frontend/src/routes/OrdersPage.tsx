import { useEffect, useState } from 'react';
import { orderService } from '../../../backend';
import { Box } from '@mui/material';
import type { OrderViewDTO } from '../../../dto/OrderViewDTO';
import { OrderItem } from '../components/OrderItem';
import { OrdersNotFound } from '../components/Order/OrdersNotFound';

export default function OrdersPage() {
    const [orders, setOrders] = useState<OrderViewDTO[]>();

    useEffect(() => {
        orderService.getAll().then((orders) => setOrders(orders));
    }, []);

    return (
        <Box>
            {!!orders && !!orders.length ? orders.map((i) => <OrderItem key={i.id} order={i} />) : <OrdersNotFound />}
        </Box>
    );
}
