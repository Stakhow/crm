import { useEffect, useState } from 'react';
import { Backdrop, Box, Card, CircularProgress } from '@mui/material';
import { OrderSummary } from '../components/Order/OrderSummary';
import { OrdersNotFound } from '../components/Order/OrdersNotFound';
import { orderStore } from '../../store';
import { OrderStatusSelect } from '../components/Order/OrderStatusSelect';
import { OrderPaidStatusSelect } from '../components/Order/OrderPaidStatusSelect';
import type { OrderQuery } from '../../../dto/OrderQuery';
import type { OrderStatus } from '../../../backend/domain/order/Order';

export default function OrdersPage() {
    const { getOrders, orders, isLoading, statuses } = orderStore((s) => s);
    const [status, setStatus] = useState<OrderQuery['status']>('all');
    const [paid, setPaid] = useState<OrderQuery['paid']>('all');

    useEffect(() => {
        getOrders({
            paid,
            status,
        });
    }, [paid, status]);

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Card sx={{ p: 2 }} raised>
                <OrderStatusSelect
                    title={'Статус'}
                    name={'status'}
                    value={status as OrderStatus}
                    options={statuses}
                    onChange={(value) => {
                        setStatus(value);

                        return value;
                    }}
                />

                <OrderPaidStatusSelect value={paid} onChange={setPaid} />
            </Card>

            {!isLoading && (
                <>
                    {!!orders && !!orders.length ? (
                        orders.map((order) => <OrderSummary key={order.id} order={order} />)
                    ) : (
                        <OrdersNotFound />
                    )}
                </>
            )}

            <Backdrop
                sx={(theme: any) => ({
                    color: '#fff',
                    zIndex: theme.zIndex.drawer + 1,
                    backdropFilter: 'blur(3px)',
                })}
                open={isLoading}
            >
                <CircularProgress color="inherit" />
            </Backdrop>
        </Box>
    );
}
