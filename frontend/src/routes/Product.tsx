import { useEffect, useState } from 'react';
import { productService } from '../../../backend';
import { ProductForm } from '../components/Product/ProductForm';
import { useNotification } from '../components/NotificationContext';
import { useParams } from 'react-router';
import type { ProductCategory } from '../../../backend/domain/product/ProductCategory';
import { Backdrop, CircularProgress } from '@mui/material';
import { ProductCard } from '../components/Product/ProductCard';
import type { ProductViewDTO } from '../../../dto/ProductViewDTO';
import type { ProductToCreateDTO } from '../../../dto/ProductToCreateDTO';

export default function Product() {
    const [categoryName, setCategoryName] = useState<ProductCategory | ''>('');
    const [product, setProduct] = useState<ProductToCreateDTO | null>(null);
    const [isLoading, setLoading] = useState<boolean>(false);
    const [productView, setProductView] = useState<ProductViewDTO | null>(null);

    const { notify } = useNotification();

    const { id } = useParams();

    useEffect(() => {
        if (!!id) {
            setLoading(true);
            productService
                .initToEdit(+id)
                .then((product) => {
                    setCategoryName(product.category.name);
                    setProduct(product);
                })
                .catch((e) => {
                    console.log(e);
                    notify({ message: 'Помилка при отриманні продукту initToEdit', severity: 'error' });
                })
                .finally(() => {
                    setLoading(false);
                });

            productService
                .getProductToView(+id)
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
        <>
            <>
                {!!categoryName && (
                    <>
                        {!!productView && <ProductCard product={productView} />}
                        <ProductForm
                            onFormSubmit={(values, FormikHelpers) => {
                                !!productView &&
                                    productService
                                        .updateProduct(productView.id, values)
                                        .then((product) => {
                                            setProductView(product);
                                            notify({ message: 'Продукт успішно оновлено', severity: 'success' });
                                            FormikHelpers.setFieldValue('weight', '');
                                            FormikHelpers.setFieldValue('quantity', '');
                                        })
                                        .catch((error) => {
                                            notify({ message: 'Помилка при оновленні продукту', severity: 'error' });
                                            console.error('Error editing product:', error);
                                        })
                                        .finally(() => {
                                            FormikHelpers.setSubmitting(false);
                                        });
                            }}
                        />
                    </>
                )}
            </>
            <Backdrop sx={(theme: any) => ({ color: '#fff', zIndex: theme.zIndex.drawer + 1 })} open={isLoading}>
                <CircularProgress color="inherit" />
            </Backdrop>
        </>
    );
}
