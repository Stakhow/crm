import { Badge, Button, IconButton, type ButtonProps } from '@mui/material';
import { NavLink } from 'react-router';
import { cartStore } from '../../../store';
import { useEffect } from 'react';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
export const CartIconButton = () => {
    const { getCartToView, cart } = cartStore((s) => s);

    useEffect(() => {
        getCartToView();
    }, []);

    const quantity = !!cart ? cart.quantity : 0;

    return (
        <IconButton component={NavLink} to="/cart" size="large" color="inherit">
            <Badge badgeContent={quantity} color="error">
                <ShoppingCartIcon />
            </Badge>
        </IconButton>
    );
};

export const ToOrderProcessButton = () => {
    return (
        <Button size={'large'} variant="outlined" color="info" fullWidth to={'/orders/new'} component={NavLink}>
            Додати товар
        </Button>
    );
};

export const CartDeleteButton = () => {
    const { deleteCart } = cartStore((s) => s);

    return (
        <Button size={'large'} variant="outlined" color="error" fullWidth type={'submit'} onClick={deleteCart}>
            Видалити Корзину
        </Button>
    );
};

type CartItemDeleteButtonType = ButtonProps & {
    cartItemId: number;
};
export const CartItemDeleteButton = ({ cartItemId, ...props }: CartItemDeleteButtonType) => {
    const { deleteCartItem } = cartStore((s) => s);

    return (
        <Button
            size={'large'}
            variant="outlined"
            color="error"
            fullWidth
            type={'submit'}
            onClick={() => {
                deleteCartItem(cartItemId);
            }}
            {...props}
        >
            Видалити з корзини
        </Button>
    );
};

export const GoToCartButton = (props: ButtonProps) => (
    <Button end to={'/cart'} component={NavLink} size={'large'} variant="contained" fullWidth {...props}>
        Перейти в Корзину
    </Button>
);
