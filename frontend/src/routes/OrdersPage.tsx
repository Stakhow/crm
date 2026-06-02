import { useEffect } from 'react';
import { Box, CircularProgress } from '@mui/material';
import { OrderSummary } from '../components/Order/OrderSummary';
import { OrdersNotFound } from '../components/Order/OrdersNotFound';
import { orderStore } from '../../store';

export default function OrdersPage() {
    const { getOrders, orders, isLoading } = orderStore((s) => s);

    useEffect(() => {
        getOrders();
    }, []);

    if (isLoading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
                <CircularProgress color="primary" />
            </Box>
        );
    }

    if (!orders || orders.length === 0) {
        return <OrdersNotFound />;
    }

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {orders.map((order) => (
                <OrderSummary key={order.id} order={order} />
            ))}
        </Box>
    );
}
