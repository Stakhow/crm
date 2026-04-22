import { Card, CardContent, Divider, Typography } from '@mui/material';

import type { OrderItem } from '../../../../backend/domain/order/Order';
import { priceFormat } from '../../../../utils/utils';

export function OrderItem({ item }: { item: OrderItem }) {
    return (
        <Card raised>
            <CardContent>
                <Typography gutterBottom variant="h5" component="div">
                    {item.name}
                </Typography>

                <Divider sx={{ my: 1 }} />

                <small>ID: {item.id}</small>

                {item.modifiers.map(({ title, value, price }, idx) => (
                    <Typography key={idx} sx={{ color: 'text.secondary' }}>
                        {title}: <b>{value}</b> {priceFormat(price)}
                    </Typography>
                ))}

                {item.params.map(({ title, value }, idx) => (
                    <Typography key={idx} sx={{ color: 'text.secondary' }}>
                        {title}: <b>{value}</b>
                    </Typography>
                ))}

                <Divider sx={{ my: 2 }} />

                <Typography>
                    Кількість
                    {item.category === 'bag' ? ' (шт.): ' : ' (кг): '}
                    <b>{item.quantity}</b>
                </Typography>

                <Typography>
                    Ціна за кг: <b>{priceFormat(item.price)}</b>
                </Typography>

                <Typography gutterBottom>
                    Вартість: <b>{priceFormat(item.totalAmount)}</b>
                </Typography>
            </CardContent>
        </Card>
    );
}
