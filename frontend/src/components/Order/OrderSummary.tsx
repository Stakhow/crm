import { NavLink } from 'react-router';
import { dateToLocalString, quantityFormat } from '../../../../utils/utils';
import { Button, Card, CardActions, CardContent, Chip, Paper, Typography } from '@mui/material';
import { grey, red, green } from '@mui/material/colors';
import { OrderTotalAmount } from './OrderTotalAmount';
import type { OrderViewUI } from '../../../store/OrderStore';

export function OrderSummary({ order }: { order: OrderViewUI }) {
    const color = {
        InProgress: red[400],
        Done: green[500],
        Cancelled: grey[400],
    };

    return (
        <Card raised component={Paper} sx={{ my: 1.5 }}>
            <CardContent>
                <Typography variant="body2" sx={{ color: 'text.secondary', my: 2 }} gutterBottom>
                    Статус:{' '}
                    <Chip
                        size="small"
                        component={'span'}
                        label={order.statusTitle}
                        sx={{ mx: 0.2, bgcolor: color[order.status], color: 'white' }}
                    />
                    {order.paid && (
                        <Chip size="small" component={'span'} label="Cплачено" color="success" sx={{ mx: 0.2 }} />
                    )}
                </Typography>
                <Typography gutterBottom variant="h5">
                    {order.client.name}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Дата замовлення: <b>{dateToLocalString(order.createdAt)}</b>
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Виконати на: <b>{dateToLocalString(order.deadline)}</b>
                </Typography>

                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Товари:{' '}
                    <b>{order.items.map((i) => `${i.name} - ${quantityFormat(i.quantity, i.unit)}`).join('; ')}</b>
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
