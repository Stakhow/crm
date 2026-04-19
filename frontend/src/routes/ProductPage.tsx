import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Backdrop, Box, Button, CircularProgress } from '@mui/material';
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
        if (Number(id)) getProduct(Number(id));
    }, []);

    return (
        <Box>
            {!!product ? (
                <>
                    <ProductCard
                        product={product}
                        isProductPage={true}
                        children={
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
                        }
                    />
                    <FormComponent
                        id={product.id}
                        values={product.productToCreate}
                        onSubmit={(values) => {
                            saveProduct(values, product.id);
                        }}
                    />

                    <ConfirmationDialog
                        isOpen={openDialog}
                        title={'Видалити продукт зі складу?'}
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
