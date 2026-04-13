import { NavLink } from 'react-router';
import type { OrderViewDTO } from '../../../dto/OrderViewDTO';
import { dateToLocalString, priceFormat } from '../../../utils/utils';
import { Button, Card, CardActions, CardContent, Paper, Typography } from '@mui/material';
import { grey, red, green } from '@mui/material/colors';

export function OrderItem({ order }: { order: OrderViewDTO }) {
    const color = {
        InProgress: red[100],
        Done: green[100],
        Cancelled: grey[400],
    };

    return (
        <Card raised component={Paper} sx={{ my: 1.5, background: color[order.status] }}>
            <CardContent>
                <Typography gutterBottom sx={{ color: 'text.secondary', fontSize: 14 }}>
                    Номер замовлення: {order.id}
                </Typography>
                <Typography gutterBottom variant="h5" component="div">
                    {order.client.name}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Дата замовлення: <b>{dateToLocalString(order.createdAt)}</b>
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Статус: <b>{order.statusTitle}</b>
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Товари: <b>{order.items.map((i) => `${i.name}`).join(' | ')}</b>
                </Typography>
            </CardContent>
            <CardActions sx={{ textAlign: 'center', p: 2, pt: 0, justifyContent: 'space-between' }}>
                <Button size="small" variant="outlined" component={NavLink} to={`/orders/${order.id}`}>
                    Переглянути
                </Button>

                <Typography gutterBottom variant="h6">
                    Сума: {priceFormat(order.totalAmount)}
                </Typography>
            </CardActions>
        </Card>
    );
}
