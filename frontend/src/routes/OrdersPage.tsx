import { useEffect } from 'react';
import { Box } from '@mui/material';
import { OrderSummary } from '../components/Order/OrderSummary';
import { OrdersNotFound } from '../components/Order/OrdersNotFound';
import { orderStore } from '../../store';

export default function OrdersPage() {
    const { getOrders, orders } = orderStore((s) => s);
    console.log(orders);
    useEffect(() => {
        getOrders();
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
