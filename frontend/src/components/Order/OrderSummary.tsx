import { NavLink } from 'react-router';
import { dateToLocalString } from '../../../../utils/utils';
import { Button, Card, CardActions, CardContent, Chip, Paper, Stack, Typography } from '@mui/material';
import { grey, red, green } from '@mui/material/colors';
import type { OrderViewDTO } from '../../../../dto/OrderViewDTO';
import { OrderTotalAmount } from './OrderTotalAmount';

export function OrderSummary({ order }: { order: OrderViewDTO }) {
    const color = {
        InProgress: red[400],
        Done: green[500],
        Cancelled: grey[400],
    };

    return (
        <Card raised component={Paper} sx={{ my: 1.5 }}>
            <CardContent>
                <Stack direction={'row'} justifyContent={'space-between'} alignItems={'center'}>
                    <Typography gutterBottom sx={{ color: 'text.secondary', fontSize: 14 }}>
                        Номер замовлення: {order.id}
                    </Typography>
                    {order.isPaid && <Chip label="Cплачено" color="success" />}
                    <Chip component={'span'} label={order.statusTitle} sx={{ bgcolor: color[order.status] }} />
                </Stack>

                <Typography gutterBottom variant="h5" component="div">
                    {order.client.name}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Дата замовлення: <b>{dateToLocalString(order.createdAt)}</b>
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Виконати на: <b>{dateToLocalString(order.deadline)}</b>
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Статус: <b>{order.statusTitle}</b>
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Товари: <b>{order.items.map((i) => `${i.name}`).join(' | ')}</b>
                </Typography>
            </CardContent>
            <CardActions
                sx={{ textAlign: 'center', p: 2, pt: 0, justifyContent: 'space-between', flexDirection: 'column' }}
            >
                <OrderTotalAmount totalAmount={order.totalAmount} />

                <Button size="large" variant="outlined" component={NavLink} to={`/orders/${order.id}`} fullWidth>
                    Переглянути
                </Button>
            </CardActions>
        </Card>
    );
}
