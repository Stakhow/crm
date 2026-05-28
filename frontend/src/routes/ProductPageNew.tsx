import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Backdrop, Box, CircularProgress } from '@mui/material';

import { FormComponent } from '../components/Product/FormComponent';
import { CategoryWithState } from '../components/Categories';

import { categoryStore, productStore } from '../../store/index';

export default function ProductPageNew() {
    const { initCreate, isLoading, createProduct, getProductProps, propsToCreate } = productStore((state) => state);

    const { categoryName } = categoryStore((state) => state);
    const navigate = useNavigate();

    useEffect(() => {
        initCreate();
    }, []);

    useEffect(() => {
        if (!!categoryName) {
            getProductProps(categoryName);
        }
    }, [categoryName]);

    return (
        <Box>
            <CategoryWithState />

            {!!categoryName && !!propsToCreate && (
                <FormComponent
                    
                    props={propsToCreate}
                    onSubmit={async (values) => {
                        const product = await createProduct(values);
                        console.log('product created', product);
                        if (!!product && !!product.id) navigate(`/products/${product.id}`);
                    }}
                />
            )}

            <Backdrop sx={(theme: any) => ({ color: '#fff', zIndex: theme.zIndex.drawer + 1 })} open={isLoading}>
                <CircularProgress color="inherit" />
            </Backdrop>
        </Box>
    );
}
