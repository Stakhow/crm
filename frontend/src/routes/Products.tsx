import { useEffect, useState, type ReactNode } from 'react';
import { productService } from '../../../backend';
import { Categories } from '../components/Categories';
import { Backdrop, Box, Button, CardActions, CircularProgress, Divider, Paper, Stack, Typography } from '@mui/material';
import { NotFoundImg } from '../components/NotFound';
import { ProductCard } from '../components/Product/ProductCard';
import { useNotification } from '../components/NotificationContext';
import { ConfirmationDialog } from '../components/ConfirmationDialog';
import type { ProductViewDTO } from '../../../dto/ProductViewDTO';
import { ProductUpdateQuantity } from '../components/Product/ProductUpdateQuantity';
import { NavLink } from 'react-router';
import type { ProductCategoryDTO } from '../../../dto/ProductCategoryDTO';

interface Dialog {
    title?: string;
    message?: string;
    children?: ReactNode;
    handleConfirmClick?: () => void;
}

export default function Products() {
    const [products, setProducts] = useState<ProductViewDTO[]>([]);
    const [isLoading, setLoading] = useState<boolean>(true);
    const [categoryName, setCategoryName] = useState<ProductCategoryDTO['name']>();
    const [categories, setCategories] = useState<ProductCategoryDTO[]>([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [dialogConfig, setDialogConfig] = useState<Dialog | null>(null);

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
        setLoading(true);
        productService
            .getProducts(categoryName)
            .then((products) => {
                setProducts(products);
                setLoading(false);
            })
            .catch((e) => {
                setLoading(false);
                console.log(e);
                notify({ message: 'Помилка отримання продуктів', severity: 'error' });
            });
    }, [categoryName]);

    const deleteProduct = (id: number) => {
        setOpenDialog(true);

        setDialogConfig({
            title: 'Видалити продукт?',
            handleConfirmClick: () => {
                productService
                    .delete(id)
                    .then(() => {
                        notify({ message: 'Продукт успішно видалено', severity: 'success' });
                        setProducts((v) => v.filter((i) => i.id !== id));
                    })
                    .catch(() => notify({ message: 'Помилка видалення', severity: 'error' }))
                    .finally(() => {
                        setOpenDialog(false);
                    });
            },
        });
    };

    const updateQuantityModal = (product: ProductViewDTO, unitOperation: 'add' | 'subtract') => {
        setOpenDialog(true);

        setDialogConfig({
            children: (
                <ProductUpdateQuantity
                    unitOperation={unitOperation}
                    onSubmit={(data) => {
                        productService
                            .updateProductQuantity(product.id, data)
                            .then((product) => {
                                setProducts((products) => products.map((i) => (i = i.id === product.id ? product : i)));
                                notify({ message: 'Параметр успішно оновлено', severity: 'success' });
                            })
                            .catch((e) => {
                                console.log(e);
                                notify({ message: 'Помилка при оновленні параметру', severity: 'error' });
                            })
                            .finally(() => {
                                setOpenDialog(false);
                                setDialogConfig(null);
                            });
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

    const productsList = products.map((product, idx) => {
        return (
            <ProductCard
                key={idx}
                product={product}
                children={
                    <CardActions sx={{ p: 2 }}>
                        <Stack sx={{ width: '100%' }}>
                            <Stack direction="row" spacing={1} divider={<Divider orientation="vertical" flexItem />}>
                                <Button
                                    color="warning"
                                    size="small"
                                    fullWidth
                                    to={`${product.id}`}
                                    component={NavLink}
                                    variant="outlined"
                                >
                                    Редагувати
                                </Button>
                                <Button
                                    size="small"
                                    color="error"
                                    fullWidth
                                    onClick={() => {
                                        deleteProduct(product.id);
                                    }}
                                    variant="outlined"
                                >
                                    Видалити
                                </Button>
                            </Stack>
                            <Divider orientation="vertical" sx={{ my: 1, width: '100%' }} flexItem />
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
                        </Stack>
                    </CardActions>
                }
            />
        );
    });

    return (
        <Box>
            <Paper sx={{ p: 2, mb: 2 }}>
                <Categories
                    name={'categoryName'}
                    categories={categories}
                    value={categoryName}
                    onChange={(e: React.ChangeEvent<any>) => {
                        setCategoryName(e.target.value);
                    }}
                />
            </Paper>

            {!!products.length
                ? productsList
                : !!categoryName && (
                      <Box>
                          <Typography mt={3} textAlign={'center'} variant="h5">
                              Продуктів не знайдено
                          </Typography>
                          <NotFoundImg />
                      </Box>
                  )}

            <ConfirmationDialog
                isOpen={openDialog}
                title={dialogConfig?.title}
                children={dialogConfig?.children}
                handleClose={() => setOpenDialog(false)}
                handleConfirmClick={() => {
                    if (typeof dialogConfig?.handleConfirmClick !== 'undefined') dialogConfig?.handleConfirmClick();
                }}
            />
            <Backdrop sx={(theme: any) => ({ color: '#fff', zIndex: theme.zIndex.drawer + 1 })} open={isLoading}>
                <CircularProgress color="inherit" />
            </Backdrop>
        </Box>
    );
}
