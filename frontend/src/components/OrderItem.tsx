import { NavLink } from 'react-router';
import type { OrderViewDTO } from '../../../dto/OrderViewDTO';
import { dateToLocalString, priceFormat } from '../../../utils/utils';
import { Button, Card, CardActions, CardContent, Paper, Typography } from '@mui/material';

export function OrderItem({ order }: { order: OrderViewDTO }) {
    return (
        <Card component={Paper} elevation={5} sx={{ my: 1 }}>
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
                    Товари: <b>{order.statusTitle}</b>
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
