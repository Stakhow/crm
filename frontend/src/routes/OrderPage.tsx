import { useParams } from 'react-router';
import { useEffect } from 'react';
import { Backdrop, Box, Card, CircularProgress, Stack, Typography } from '@mui/material';
import { dateToLocalString } from '../../../utils/utils';
import { ProductCard } from '../components/Product/ProductCard';

import { OrderStatusSelect } from '../components/Order/OrderStatusSelect';
import { OrdersNotFound } from '../components/Order/OrdersNotFound';
import { OrderTotalAmount } from '../components/OrderTotalAmount';
import { BottomBar } from '../components/BottomBar';
import { RepeatOrderButton } from '../components/Order/OrderButtons';
import { orderStore } from '../../store';
import { ClientItem } from '../components/Client/ClientItem';

export default function OrderPage() {
    let { id } = useParams();
    const { order, getOrder, isLoading, updateStatus } = orderStore((s) => s);

    useEffect(() => {
        console.log(order);
        getOrder(Number(id));
    }, []);
    useEffect(() => {}, [order]);

    return (
        <Box>
            {!isLoading && !!order ? (
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
                                onChange={async (value) => {
                                    await updateStatus(order.id, value);
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
