import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Backdrop, Box, CircularProgress } from '@mui/material';

import { FormComponent } from '../components/Product/FormComponent';
import { CategoryWithState } from '../components/Categories';

import { categoryStore, productStore } from '../../store/index';
import { ComponentNotFound } from '../components/ComponentNotFound';

export default function ProductPageNew() {
    const { initCreate, isLoading, saveProduct, getProduct, product } = productStore((state) => state);

    const { categoryName } = categoryStore((state) => state);
    const navigate = useNavigate();

    useEffect(() => {
        initCreate();
    }, []);

    useEffect(() => {
        if (!!categoryName) getProduct(0, categoryName);
    }, [categoryName]);

    return (
        <Box>
            <CategoryWithState />

            {!!categoryName && (
                <>
                    {!!product ? (
                        <FormComponent
                            id={product.id}
                            values={product.productToCreate}
                            onSubmit={async (values) => {
                                const product = await saveProduct(values);

                                if (!!product && !!product.id) navigate(`/products/${product.id}`);
                            }}
                        />
                    ) : (
                        <ComponentNotFound
                            title={'На даної категорії товарів не задано модифікаторів'}
                            buttonText={'Додати модифікатор'}
                            link={'/modifiers'}
                        />
                    )}
                </>
            )}

            <Backdrop sx={(theme: any) => ({ color: '#fff', zIndex: theme.zIndex.drawer + 1 })} open={isLoading}>
                <CircularProgress color="inherit" />
            </Backdrop>
        </Box>
    );
}
