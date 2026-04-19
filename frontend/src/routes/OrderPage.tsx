import { useParams } from 'react-router';
import { useEffect, useState } from 'react';
import { Backdrop, Box, Card, CircularProgress, Stack, Typography } from '@mui/material';
import { orderService } from '../../../backend';
import type { OrderViewDTO } from '../../../dto/OrderViewDTO';
import { dateToLocalString } from '../../../utils/utils';
import { ProductCard } from '../components/Product/ProductCard';
import { useNotification } from '../components/NotificationContext';
import type { OrderStatus } from '../../../backend/domain/order/Order';
import { ClientItem } from '../components/ClientItem';
import { OrderStatusSelect } from '../components/Order/OrderStatusSelect';
import { OrdersNotFound } from '../components/Order/OrdersNotFound';
import { OrderTotalAmount } from '../components/OrderTotalAmount';
import { BottomBar } from '../components/BottomBar';
import { RepeatOrderButton } from '../components/Order/OrderButtons';

export default function OrderPage() {
    let { id } = useParams();

    const [order, setOrder] = useState<OrderViewDTO>();
    const [isLoading, setLoading] = useState<boolean>(false);
    const { notify } = useNotification();

    useEffect(() => {
        !!id &&
            orderService.getById(Number(id)).then((order) => {
                setOrder(order);
            });
    }, []);

    const updateOrderStatus = (status: OrderStatus) => {
        setLoading(true);
        orderService
            .updateStatus(Number(id), status)
            .then(() => {
                notify({ message: 'Статус оновлено', severity: 'success' });
            })
            .catch((error) => {
                notify({
                    message: `Помилка оновлення статусу: ${error.message ?? error.message}`,
                    severity: 'error',
                });
            })
            .finally(() => {
                setLoading(false);
            });
    };

    return (
        <Box>
            {!!order ? (
                <Box mb={8}>
                    <Card sx={{ p: 2 }} raised>
                        <Stack direction={'column'} spacing={2}>
                            <Typography variant={'h5'} component={'h1'}>
                                Замовлення #: {order.id}
                            </Typography>

                            <Typography>
                                Від: <b> {dateToLocalString(order.createdAt)}</b>
                            </Typography>
                            <Typography>
                                Виконати на: <b> {dateToLocalString(order.deadline)}</b>
                            </Typography>

                            <ClientItem client={order.client} raised={false} />

                            <OrderStatusSelect
                                title={'Статус'}
                                name={'status'}
                                value={order.status}
                                options={order.statuses}
                                onChange={(value) => {
                                    updateOrderStatus(value);
                                }}
                            />
                            <Typography></Typography>

                            <OrderTotalAmount totalAmount={order.totalAmount} />
                        </Stack>
                    </Card>

                    {order.items.map((product, idx) => (
                        <ProductCard key={idx} product={product} isInCart={true} />
                    ))}

                    <BottomBar>
                        <RepeatOrderButton orderId={Number(id)} />
                    </BottomBar>
                </Box>
            ) : (
                <OrdersNotFound title={`Такого замовлення не існує #:${id}`} />
            )}

            <Backdrop sx={(theme: any) => ({ color: '#fff', zIndex: theme.zIndex.drawer + 1 })} open={isLoading}>
                <CircularProgress color="inherit" />
            </Backdrop>
        </Box>
    );
}
