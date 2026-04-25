import { Box, Card, Stack, Typography } from '@mui/material';
import { dateToLocalString } from '../../../../utils/utils';
import { BottomBar } from '../BottomBar';
import { ClientItem } from '../Client/ClientItem';
import { OrderTotalAmount } from './OrderTotalAmount';
import { RepeatOrderButton } from './OrderButtons';
import { OrderStatusSelect } from './OrderStatusSelect';
import { orderStore } from '../../../store';
import { OrdersNotFound } from './OrdersNotFound';
import { OrderItem } from './OrderItem';
import { OrderAmountPaid } from './OrderAmountPaid';

export const OrderFullItem = () => {
    const { order, updateStatus } = orderStore((s) => s);

    if (!order) return <OrdersNotFound title={`Такого замовлення не існує`} />;

    return (
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

                    <OrderAmountPaid />

                    <OrderTotalAmount totalAmount={order.totalAmount} />
                </Stack>
            </Card>

            <Typography textAlign={'center'} sx={{ mt: 4, mb: 2 }} variant="h6">
                Товари в замовленні:
            </Typography>

            {order.items.map((item, idx) => (
                <OrderItem key={idx} item={item} />
            ))}

            <BottomBar>
                <RepeatOrderButton orderId={order.id} />
            </BottomBar>
        </Box>
    );
};
