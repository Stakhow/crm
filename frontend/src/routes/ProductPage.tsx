import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Backdrop, Box, Button, Card, CardActions, CircularProgress, Stack } from '@mui/material';
import { ProductCard } from '../components/Product/ProductCard';

import { FormComponent } from '../components/Product/FormComponent';
import { productStore } from '../../store';
import { ConfirmationDialog } from '../components/ConfirmationDialog';
import { ProductNotFound } from '../components/Product/ProductNotFound';

export default function ProductPage() {
    const { getProduct, product, isLoading, saveProduct, deleteProduct, error } = productStore((state) => state);
    const [openDialog, setOpenDialog] = useState(false);

    const { id } = useParams();
    const navigate = useNavigate();

    const onDelete = async (id: number) => {
        await deleteProduct(id);
        if (!error) navigate(`/products/`, { replace: true });
    };

    useEffect(() => {
        console.log(Number(id));
        if (Number(id)) getProduct(Number(id));
        // else navigate(`/products/`, { replace: true });
    }, []);

    return (
        <Box>
            {!!product ? (
                <>
                    <ProductCard
                        product={product}
                        children={
                            <CardActions sx={{ p: 2 }}>
                                <Stack sx={{ width: '100%' }}>
                                    <Button
                                        size="small"
                                        color="error"
                                        fullWidth
                                        onClick={() => {
                                            setOpenDialog(true);
                                        }}
                                        variant="outlined"
                                    >
                                        Видалити
                                    </Button>
                                </Stack>
                            </CardActions>
                        }
                    />
                    <Card raised sx={{ p: 2, mb: 2 }}>
                        <FormComponent
                            id={product.id}
                            values={product.productToCreate}
                            onSubmit={(values) => {
                                saveProduct(values, product.id);
                            }}
                        />
                    </Card>

                    <ConfirmationDialog
                        isOpen={openDialog}
                        title={'Видалити продукт?'}
                        handleClose={() => setOpenDialog(false)}
                        handleConfirmClick={() => {
                            onDelete(product.id);
                        }}
                    />
                </>
            ) : (
                <ProductNotFound />
            )}

            <Backdrop sx={(theme: any) => ({ color: '#fff', zIndex: theme.zIndex.drawer + 1 })} open={isLoading}>
                <CircularProgress color="inherit" />
            </Backdrop>
        </Box>
    );
}
