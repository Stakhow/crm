import { useEffect, useState, type ReactNode } from 'react';
import { Categories } from '../components/Categories';
import { Backdrop, Box, Button, CircularProgress, Divider, Stack } from '@mui/material';
import { ProductCard } from '../components/Product/ProductCard';
import { ConfirmationDialog } from '../components/ConfirmationDialog';
import type { ProductViewDTO } from '../../../dto/ProductViewDTO';
import { ProductUpdateQuantity } from '../components/Product/ProductUpdateQuantity';
import { productStore, categoryStore } from '../../store';
import { ProductNotFound } from '../components/Product/ProductNotFound';

interface Dialog {
    title?: string;
    message?: string;
    children?: ReactNode;
    handleConfirmClick?: () => void;
}

export default function ProductsPage() {
    const [openDialog, setOpenDialog] = useState(false);
    const [dialogConfig, setDialogConfig] = useState<Dialog | null>(null);

    const { products, isLoading, getProducts, updateProductQuantity } = productStore((state) => state);
    const { categories, categoryName, getCategories, setCategory } = categoryStore((state) => state);
    const isCategoriesLoading = categoryStore((state) => state.isLoading);

    useEffect(() => {
        getCategories();
    }, []);

    useEffect(() => {
        getProducts(categoryName);
    }, [categoryName]);

    const updateQuantityModal = (product: ProductViewDTO, unitOperation: 'add' | 'subtract') => {
        setOpenDialog(true);

        setDialogConfig({
            children: (
                <ProductUpdateQuantity
                    unitOperation={unitOperation}
                    onSubmit={(data) => {
                        updateProductQuantity(product.id, data);
                        setOpenDialog(false);
                    }}
                    handleClose={() => {
                        setOpenDialog(false);
                    }}
                    limit={unitOperation === 'subtract' ? product.quantity : undefined}
                    categoryName={product.categoryName}
                />
            ),
        });
    };

    const ProductsList = () =>
        products.map((product, idx) => {
            return (
                <ProductCard
                    key={idx}
                    product={product}
                    children={
                        <Stack direction="row" spacing={1} divider={<Divider orientation="vertical" flexItem />}>
                            <Button
                                size="large"
                                fullWidth
                                onClick={() => {
                                    updateQuantityModal(product, 'add');
                                }}
                                variant="outlined"
                            >
                                Додати Кількість
                            </Button>
                            <Button
                                size="large"
                                fullWidth
                                disabled={!product.quantity}
                                onClick={() => {
                                    updateQuantityModal(product, 'subtract');
                                }}
                                variant="outlined"
                            >
                                Зменшити Кількість
                            </Button>
                        </Stack>
                    }
                />
            );
        });

    return (
        <Box>
            <Categories
                name={'categoryName'}
                categories={categories}
                value={categoryName}
                onChange={(e: React.ChangeEvent<any>) => {
                    setCategory(e.target.value);
                }}
            />

            {!isLoading && (!!products.length ? <ProductsList /> : !!categoryName && <ProductNotFound />)}

            <ConfirmationDialog
                isOpen={openDialog}
                title={dialogConfig?.title}
                children={dialogConfig?.children}
                handleClose={() => setOpenDialog(false)}
                handleConfirmClick={() => {
                    if (typeof dialogConfig?.handleConfirmClick !== 'undefined') dialogConfig?.handleConfirmClick();
                }}
            />

            <Backdrop
                sx={(theme: any) => ({
                    color: '#fff',
                    zIndex: theme.zIndex.drawer + 1,
                    backdropFilter: 'blur(3px)',
                })}
                open={isCategoriesLoading || isLoading}
            >
                <CircularProgress color="inherit" />
            </Backdrop>
        </Box>
    );
}
