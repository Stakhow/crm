import { cartStore } from '../../../store';
import { Card, Divider, Typography } from '@mui/material';
import { priceFormat, quantityFormat } from '../../../../utils/utils';
import { CartItemDeleteButton } from './CartButtons';
import { ListItemDots } from '../ListItemDots';

export const CartList = () => {
    const { items } = cartStore((s) => s);

    return (
        <>
            {!!items && !!items.length && (
                <Card sx={{ p: 2 }} raised>
                    <Typography textAlign={'center'} variant="h6">
                        Товари в корзині
                    </Typography>

                    {items.map((cartItem) => (
                        <Card variant="outlined" key={cartItem.productId} sx={{ p: 2, mb: 3 }}>
                            <Typography variant="h6" textAlign={'center'} fontWeight={'bold'}>
                                {cartItem.name}
                            </Typography>

                            <Divider sx={{ mb: 1 }} />

                            <ListItemDots title="Ціна" value={`${priceFormat(cartItem.price)}./кг`} />
                            <ListItemDots title="Кількість" value={quantityFormat(cartItem.quantity, cartItem.unit)} />
                            <ListItemDots title="Вартість" value={priceFormat(cartItem.total)} />

                            <CartItemDeleteButton productId={cartItem.productId} size={'small'} sx={{ mt: 1 }} />
                        </Card>
                    ))}
                </Card>
            )}
        </>
    );
};
