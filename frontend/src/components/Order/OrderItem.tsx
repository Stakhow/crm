import { Card, CardContent, Divider, Typography } from '@mui/material';

import type { OrderItem } from '../../../../backend/domain/order/Order';
import { priceFormat } from '../../../../utils/utils';
import { ListItemDots } from '../ListItemDots';

export function OrderItem({ item }: { item: OrderItem }) {
    return (
        <Card raised sx={{ mb: 2 }}>
            <CardContent>
                <Typography gutterBottom variant="h5" component="div">
                    {item.name}
                </Typography>

                <Divider sx={{ my: 1 }} />

                <ListItemDots title={'Кількість'} value={item.quantity} />
                <ListItemDots title={'Ціна'} value={`${priceFormat(item.price)}/кг`} />
                <ListItemDots title={'Вартість'} value={priceFormat(item.totalAmount)} />
            </CardContent>
        </Card>
    );
}
