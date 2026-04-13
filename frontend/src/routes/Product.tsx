import { useEffect, useState } from 'react';
import { productService } from '../../../backend';
import { useNotification } from '../components/NotificationContext';
import { useParams } from 'react-router';
import { Backdrop, Box, Card, CircularProgress } from '@mui/material';
import { ProductCard } from '../components/Product/ProductCard';
import type { ProductViewDTO } from '../../../dto/ProductViewDTO';
import type { ProductToCreateDTO } from '../../../dto/ProductToCreateDTO';

import { FormComponent } from '../components/Product/FormComponent';


export default function Product() {
    const [isLoading, setLoading] = useState<boolean>(false);
    const [productView, setProductView] = useState<ProductViewDTO | null>(null);
    const [values, setValues] = useState<ProductToCreateDTO>();

    const { notify } = useNotification();

    const { id } = useParams();
    const productId = id ? +id : 0;


    useEffect(() => {
        if (!!productId) {
            setLoading(true);
            productService
                .initToEdit(productId)
                .then((product) => {
                    setValues(product);
                })
                .catch((error) => {
                    console.log(error);
                    notify({ message: `Помилка при отриманні продукту: ${error.message}`, severity: 'error' });
                })
                .finally(() => {
                    setLoading(false);
                });

            productService
                .getProductToView(productId)
                .then((product) => {
                    setProductView(product);
                })
                .catch((e) => {
                    console.log(e);
                    notify({ message: 'Помилка при отриманні продукту getProductToView', severity: 'error' });
                })
                .finally(() => {
                    setLoading(false);
                });
        }
    }, []);

    return (
        <Box>
            {!!productView && <ProductCard product={productView} />}

            

            {!!values && (
                <Card raised sx={{ p: 2, mb: 2 }}>
                    {<FormComponent id={productId} values={values} />}
                </Card>
            )}

            <Backdrop sx={(theme: any) => ({ color: '#fff', zIndex: theme.zIndex.drawer + 1 })} open={isLoading}>
                <CircularProgress color="inherit" />
            </Backdrop>
        </Box>
    );
}
