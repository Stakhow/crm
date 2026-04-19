import { cartStore } from '../../../store';
import { Box, Card, Typography } from '@mui/material';
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
                    <hr />
                    {items.map((cartItem, idx) => (
                        <Box key={cartItem.productId} my={1}>
                            <Typography>
                                {++idx}. <b>{cartItem.name}</b> |{' '}
                                <b>{quantityFormat(cartItem.quantity, cartItem.unit)}</b> |{' '}
                                <b>{priceFormat(cartItem.price)}</b> <b>{priceFormat(cartItem.total)}</b>
                            </Typography>
                            <CartItemDeleteButton cartItemId={cartItem.productId} size={'small'} />
                        </Box>
                    ))}
                </Card>
            )}
        </>
    );
};
