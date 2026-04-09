import { Box } from '@mui/material';
import { type FormikHelpers } from 'formik';
import { useEffect, useState } from 'react';
import { Categories } from '../Categories';
import type { ProductToCreateDTO } from '../../../../dto/ProductToCreateDTO';
import type { ProductCategory } from '../../../../backend/domain/product/ProductCategory';
import type { ProductFormValuesDTO } from '../../../../dto/ProductFormValuesDTO';
import { productService } from '../../../../backend';
import { useNotification } from '../NotificationContext';
import type { ProductCategoryDTO } from '../../../../dto/ProductCategoryDTO';
import { FormComponent } from './FormComponent';

export function ProductForm({
    onFormSubmit,
    values,
}: {
    onFormSubmit: (values: ProductFormValuesDTO, FormikHelpers: FormikHelpers<ProductFormValuesDTO>) => void;
    values?: ProductFormValuesDTO;
}) {
    const [price, setPrice] = useState<number>(0);
    const [categoryName, setCategoryName] = useState<ProductCategory>();
    const [categories, setCategories] = useState<ProductCategoryDTO[]>();
    const [product, setProduct] = useState<ProductToCreateDTO>();
    const [isLoading, setLoading] = useState<boolean>(false);

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
                    notify({ message: 'Помилка при отриманні продукту init', severity: 'error' });
                })
                .finally(() => {
                    setLoading(false);
                });
        }
    }, [categoryName]);

    return (
        <Box>
            {!!categories && (
                <Categories
                    name={'categoryName'}
                    categories={categories}
                    value={categoryName ?? ''}
                    onChange={(e) => {
                        setCategoryName(e.target.value);
                    }}
                />
            )}

            {!!product && <FormComponent product={product} onFormSubmit={onFormSubmit} values={values} />}
        </Box>
    );
}
