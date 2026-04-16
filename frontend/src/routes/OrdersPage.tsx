import { useEffect, useState } from 'react';
import { orderService } from '../../../backend';
import { Box } from '@mui/material';
import type { OrderViewDTO } from '../../../dto/OrderViewDTO';
import { OrderItem } from '../components/OrderItem';
import { ComponentNotFound } from '../components/ComponentNotFound';

export default function OrdersPage() {
    const [orders, setOrders] = useState<OrderViewDTO[]>();

    useEffect(() => {
        orderService.getAll().then((orders) => setOrders(orders));
    }, []);

    return (
        <Box>
            {!!orders && !!orders.length ? (
                orders.map((i) => <OrderItem key={i.id} order={i} />)
            ) : (
                <ComponentNotFound title={'Немає замовлень'} buttonText={'Створити замовлення'} link={'/orders/new'} />
            )}
        </Box>
    );
}
