import { useEffect, useState } from 'react';
import { orderService } from '../../../backend';
import { Box } from '@mui/material';
import type { OrderViewDTO } from '../../../dto/OrderViewDTO';
import { OrderSummary } from '../components/Order/OrderSummary';
import { OrdersNotFound } from '../components/Order/OrdersNotFound';

export default function OrdersPage() {
    const [orders, setOrders] = useState<OrderViewDTO[]>();

    useEffect(() => {
        orderService.getAll().then((orders) => setOrders(orders));
    }, []);

    return (
        <Box>
            {!!orders && !!orders.length ? (
                orders.map((i) => <OrderSummary key={i.id} order={i} />)
            ) : (
                <OrdersNotFound />
            )}
        </Box>
    );
}
