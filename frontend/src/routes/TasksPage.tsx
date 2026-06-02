import { useEffect, useState } from 'react';
import { Backdrop, Box, Button, CircularProgress, Divider, Stack, Typography } from '@mui/material';
import { ProductProduceCard } from '../components/Product/ProductCard';
import { ConfirmationDialog } from '../components/ConfirmationDialog';
import { productStore } from '../../store';

export default function TasksPage() {
    const [productId, setProductId] = useState<string>('');
    const { productsToProduce, isLoading, getProductsToProduce, setProcustAsProduced } = productStore((state) => state);

    useEffect(() => {
        getProductsToProduce();
    }, []);

    const ProductsList = () =>
        productsToProduce.map((product, idx) => {
            return (
                <ProductProduceCard
                    key={idx}
                    product={product}
                    children={
                        <Stack direction="row" spacing={1} divider={<Divider orientation="vertical" flexItem />}>
                            <Button
                                size="large"
                                fullWidth
                                onClick={() => {
                                    setProductId(product.id);
                                }}
                                variant="outlined"
                            >
                                Позначити як виконане
                            </Button>
                        </Stack>
                    }
                />
            );
        });

    return (
        <Box>
            {!isLoading && productsToProduce.length ? (
                <ProductsList />
            ) : (
                <Typography variant={'h5'} component={'h1'} textAlign={'center'}>
                    Немає завдань на виготовлення
                </Typography>
            )}

            <ConfirmationDialog
                isOpen={!!productId}
                title={'Підтвердити виконання?'}
                handleClose={() => setProductId('')}
                handleConfirmClick={() => {
                    setProcustAsProduced(productId);
                    setProductId('');
                }}
            />

            <Backdrop
                sx={(theme: any) => ({
                    color: '#fff',
                    zIndex: theme.zIndex.drawer + 1,
                    backdropFilter: 'blur(3px)',
                })}
                open={isLoading}
            >
                <CircularProgress color="inherit" />
            </Backdrop>
        </Box>
    );
}
