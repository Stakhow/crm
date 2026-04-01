import { useEffect, useState } from 'react';
import { productService } from '../../../backend';
import { ProductForm } from '../components/Product/ProductForm';
import { useNotification } from '../components/NotificationContext';
import { Backdrop, Box, CircularProgress, Paper, Typography } from '@mui/material';

export default function ProductNew() {
    const [isLoading, setLoading] = useState<boolean>(false);
    const { notify } = useNotification();

    return (
        <Paper sx={{ p: 2 }} elevation={12}>
            <ProductForm
                onFormSubmit={(values, FormikHelpers) => {
                    setLoading(true);
                    productService
                        .save(values.categoryName, values)
                        .then(() => {
                            notify({ message: 'Продукт успішно створено', severity: 'success' });
                            FormikHelpers.resetForm();
                        })
                        .catch((error) => {
                            console.log(error);

                            notify({
                                message: `Помилка при створенні продукту: ${error.message ?? error.message}`,
                                severity: 'error',
                            });
                        })
                        .finally(() => {
                            FormikHelpers.setSubmitting(false);
                            setLoading(false);
                        });
                }}
            />
            <Backdrop sx={(theme: any) => ({ color: '#fff', zIndex: theme.zIndex.drawer + 1 })} open={isLoading}>
                <CircularProgress color="inherit" />
            </Backdrop>
        </Paper>
    );
}
