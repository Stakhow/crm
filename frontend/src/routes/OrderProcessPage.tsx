import { Formik, Form } from 'formik';
import { CircularProgress, Stack, Box, Backdrop } from '@mui/material';
import { CategoryWithState } from '../components/Categories';
import type { ProductCategory } from '../../../backend/domain/product/ProductCategory';

import { cartStore, categoryStore, productStore } from '../../store';
import { BottomBar } from '../components/BottomBar';

import { GoToCartButton } from '../components/Cart/CartButtons';
import { CartProductListSelect } from '../components/Cart/CartProductsList';
import { useEffect } from 'react';
import { FormComponent } from '../components/Product/FormComponent';
import { validationSchema } from '../components/Order/validationSchema';

export interface OrderFormValues {
    totalAmount: number;
    categoryName: ProductCategory;
    id: string;
    quantity: number;
}

export default function OrderPageNew() {
    const { cart, isLoading } = cartStore((s) => s);
    const { categoryName } = categoryStore((s) => s);
    const { product, products, productId, propsToCreate, getProducts, createProduct, getProductProps } = productStore(
        (s) => s,
    );
    const isProductLoading = productStore((s) => s).isLoading;

    useEffect(() => {
        if (!!categoryName) {
            getProducts(categoryName);
        }
    }, [categoryName]);

    useEffect(() => {
        if (!isProductLoading && (productId === 'new' || !products.length)) {
            getProductProps(categoryName);
        }
    }, [productId, products]);

    // console.log(categoryName);

    const initialValues: OrderFormValues = {
        totalAmount: cart?.totalAmount ?? 0,
        categoryName: categoryName,
        id: product?.id ?? '',
        quantity: 0,
    };

    return (
        <Box>
            <Formik
                initialValues={initialValues}
                validateOnBlur={false}
                onSubmit={() => {}}
                validationSchema={validationSchema}
                enableReinitialize={true}
            >
                {({ values }) => {
                    return (
                        <Box mb={14}>
                            <Form>
                                <Stack spacing={2}>
                                    <CategoryWithState />
                                    <CartProductListSelect />
                                </Stack>
                            </Form>
                            <BottomBar>
                                <GoToCartButton disabled={values.totalAmount === 0} />
                            </BottomBar>
                            {!!propsToCreate && <FormComponent props={propsToCreate} onSubmit={createProduct} />}
                        </Box>
                    );
                }}
            </Formik>

            <Backdrop sx={(theme: any) => ({ color: '#fff', zIndex: theme.zIndex.drawer + 1 })} open={isLoading}>
                <CircularProgress color="inherit" />
            </Backdrop>
        </Box>
    );
}
