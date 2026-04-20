import { cartStore } from '../../../store';
import { Card, Typography } from '@mui/material';
import { priceFormat, quantityFormat } from '../../../../utils/utils';
import { CartItemDeleteButton } from './CartButtons';

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
                            <Typography>
                                <b>{cartItem.name}</b>
                            </Typography>

                            <Typography>Ціна:{priceFormat(cartItem.price)}/кг</Typography>
                            <Typography>
                                Кількість: <b>{quantityFormat(cartItem.quantity, cartItem.unit)}</b>
                            </Typography>
                            <Typography>
                                Вартість: <b>{priceFormat(cartItem.total)}</b>
                            </Typography>

                            <CartItemDeleteButton cartItemId={cartItem.productId} size={'small'} sx={{ mt: 1 }} />
                        </Card>
                    ))}
                </Card>
            )}
        </>
    );
};
