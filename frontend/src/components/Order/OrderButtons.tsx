import { Button, type ButtonProps } from '@mui/material';
import { cartStore, clientStore, orderStore } from '../../../store';
import { NavLink, useNavigate } from 'react-router';

export const CreateOrderButton = () => {
    const { isLoading, createOrder, dueDate: date } = orderStore((s) => s);
    const { clientId } = clientStore((s) => s);
    const { cartId, deleteCart } = cartStore((s) => s);

    const isValid = !!date && !!clientId;
    const navigate = useNavigate();

    return (
        <Button
            size={'large'}
            variant="contained"
            fullWidth
            disabled={isLoading || !isValid}
            onClick={async () => {
                const order = await createOrder(cartId, clientId);
                if (!!order) {
                    deleteCart();
                    navigate(`/orders/${order.id}`);
                }
            }}
        >
            Створити замовлення
        </Button>
    );
};

export const RepeatOrderButton = ({ orderId }: { orderId: string }) => {
    const { repeatOrder, isLoading, order } = orderStore((s) => s);
    const { getCartToView, deleteCart } = cartStore((s) => s);
    const { setClient } = clientStore((s) => s);
    const navigate = useNavigate();

    return (
        <Button
            size={'large'}
            fullWidth
            disabled={isLoading}
            variant="contained"
            onClick={async () => {
                await deleteCart();

                const cart = await repeatOrder(orderId);
                if (!!cart) {
                    navigate('/cart');
                    getCartToView(cart.id);
                    setClient(order.client.id);
                }
            }}
        >
            Повторити замовлення
        </Button>
    );
};

export const InitOrderButton = ({ ...props }: ButtonProps) => (
    <Button size={'large'} variant="contained" fullWidth component={NavLink} to={'/orders/new'} {...props}>
        Створити Замовлення
    </Button>
);
