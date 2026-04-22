import { useParams } from 'react-router';
import { useEffect } from 'react';
import { Backdrop, Box, CircularProgress } from '@mui/material';
import { orderStore } from '../../store';
import { OrderFullItem } from '../components/Order/OrderFullItem';

export default function OrderPage() {
    let { id } = useParams();
    const { getOrder, isLoading } = orderStore((s) => s);

    useEffect(() => {
        getOrder(Number(id));
    }, []);

    return (
        <Box>
            {!isLoading && <OrderFullItem />}

            <Backdrop sx={(theme: any) => ({ color: '#fff', zIndex: theme.zIndex.drawer + 1 })} open={isLoading}>
                <CircularProgress color="inherit" />
            </Backdrop>
        </Box>
    );
}
