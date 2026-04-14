import { useEffect, useState } from 'react';
import { productService } from '../../../backend';
import { useNotification } from '../components/NotificationContext';
import { Backdrop, CircularProgress, Paper } from '@mui/material';
import type { ProductCategory } from '../../../backend/domain/product/ProductCategory';
import type { ProductCategoryDTO } from '../../../dto/ProductCategoryDTO';
import type { ProductToCreateDTO } from '../../../dto/ProductToCreateDTO';
import { Categories } from '../components/Categories';
import { FormComponent } from '../components/Product/FormComponent';

export default function ProductPageNew() {
    const [isLoading, setLoading] = useState<boolean>(false);
    const [categoryName, setCategoryName] = useState<ProductCategory>();
    const [categories, setCategories] = useState<ProductCategoryDTO[]>();
    const [product, setProduct] = useState<ProductToCreateDTO>();
    const { notify } = useNotification();

    useEffect(() => {
        setLoading(true);
        productService
            .getCategories()
            .then((categories) => {
                setCategories(categories);
                setLoading(false);
            })
            .catch(() => {
                notify({ message: 'Помилка отримання категорій', severity: 'error' });
                setLoading(false);
            });
    }, []);

    useEffect(() => {
        if (!!categoryName) {
            setLoading(true);

            productService
                .init(categoryName)
                .then((product) => {
                    setProduct(product);
                })
                .catch((error) => {
                    notify({ message: `Помилка при отриманні продукту: ${error.message}`, severity: 'error' });
                })
                .finally(() => {
                    setLoading(false);
                });
        }
    }, [categoryName]);

    return (
        <Paper sx={{ p: 2 }} elevation={12}>
            {!!categories && (
                <Categories
                    name={'categoryName'}
                    categories={categories}
                    value={categoryName}
                    onChange={(e) => {
                        setCategoryName(e.target.value);
                    }}
                />
            )}

            {!!product && <FormComponent id={0} values={product} />}

            <Backdrop sx={(theme: any) => ({ color: '#fff', zIndex: theme.zIndex.drawer + 1 })} open={isLoading}>
                <CircularProgress color="inherit" />
            </Backdrop>
        </Paper>
    );
}
