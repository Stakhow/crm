import { Card, CardContent, Divider, Typography } from '@mui/material';
import { priceFormat, quantityFormat } from '../../../../utils/utils';
import { ListItemDots } from '../ListItemDots';
import type { OrderItemView } from '../../../store/OrderStore';

export function OrderItem({ item }: { item: OrderItemView }) {
    return (
        <Card raised sx={{ mb: 2 }}>
            <CardContent>
                <Typography gutterBottom variant="h5" component="div">
                    {item.name}
                </Typography>

                <Divider sx={{ my: 1 }} />

                <ListItemDots title={'Кількість'} value={quantityFormat(item.quantity, item.unit)} />
                <ListItemDots title={'Ціна'} value={`${priceFormat(item.price)}/кг`} />
                <ListItemDots title={'Вартість'} value={priceFormat(item.totalAmount)} />
            </CardContent>
        </Card>
    );
}
