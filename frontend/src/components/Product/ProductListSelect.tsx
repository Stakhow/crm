import { MenuItem, Chip, Card, FormControl, InputLabel, Select, Skeleton } from '@mui/material';
import { productStore } from '../../../store';
import { ProductNotFound } from './ProductNotFound';
import { useEffect } from 'react';
import type { ProductCategory } from '../../../../backend/domain/product/ProductCategory';

export const ProductListSelect = ({
    categoryName,
    cartItemsId = [],
}: {
    categoryName: ProductCategory;
    cartItemsId?: number[];
}) => {
    const { products, isLoading, getProducts, productId, selectProduct } = productStore((s) => s);

    useEffect(() => {
        getProducts(categoryName);
    }, [categoryName]);

    const options = products.map((product, itemIdx) => {
        const inСart = cartItemsId.includes(product.id);

        return (
            <MenuItem key={itemIdx} value={product.id} disabled={inСart}>
                {product.name} ID:
                {product.id}
                {inСart && <Chip sx={{ ml: 1 }} label="Уже в корзині" />}
                {!product.isAvailable && <Chip color="error" sx={{ ml: 1 }} label="Закінчився" />}
            </MenuItem>
        );
    });

    const List = () =>
        !!products && !!products.length ? (
            <Card sx={{ p: 2 }} raised>
                <FormControl fullWidth margin="dense">
                    <InputLabel>{'Список продуктів'}</InputLabel>
                    <Select
                        label={'Список продуктів'}
                        value={productId ?? ''}
                        id={'id'}
                        onChange={(e) => {
                            selectProduct(Number(e.target.value));
                        }}
                    >
                        {options}
                    </Select>
                </FormControl>
            </Card>
        ) : (
            <ProductNotFound />
        );

    return isLoading ? <Skeleton variant="rounded" height={102} component={Card} /> : <List />;
};
