import { Link } from 'react-router';
import type { OrderViewDTO } from '../../../dto/OrderViewDTO';
import { dateToLocalString, priceFormat } from '../../../utils/utils';
import { Paper } from '@mui/material';

export function OrderItem({ order }: { order: OrderViewDTO }) {
    return (
        <Link key={order.id} to={`/orders/${order.id}`}>
            <Paper sx={{ p: 2 }} elevation={4}>
                #:{order.id} | Сума: {priceFormat(order.totalAmount)} | Дата замовлення:{' '}
                {dateToLocalString(order.createdAt)} | Статус: {order.status}
            </Paper>
        </Link>
    );
}
