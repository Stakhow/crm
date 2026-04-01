import * as Yup from 'yup';
import { useLocation, useParams, useNavigate } from 'react-router';
import { useEffect, useState } from 'react';
import { clientService, orderService } from '../../../backend';
import type { Client } from '../../../backend/domain/client/Client';
import { Box, Link, Paper, Stack, Typography } from '@mui/material';
import type { OrderViewDTO } from '../../../dto/OrderViewDTO';
import { OrderItem } from '../components/OrderItem';

export default function Orders() {
    const [orders, setOrders] = useState<OrderViewDTO[]>();

    useEffect(() => {
        orderService.getAll().then((orders) => setOrders(orders));
    }, []);

    return (
        <Box>
            {!!orders && !!orders.length ? (
                orders.map((i) => <OrderItem key={i.id} order={i} />)
            ) : (
                <Typography textAlign={'center'} variant="h5" component={'h1'}>
                    Немає замовлень
                </Typography>
            )}
        </Box>
    );
}
