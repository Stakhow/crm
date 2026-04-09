import { useEffect, useState, type ReactNode } from 'react';
import { productService } from '../../../backend';
import { Categories } from '../components/Categories';
import { Backdrop, Box, Button, CardActions, CircularProgress, Divider, Paper, Stack, Typography } from '@mui/material';
import { NotFoundImg } from '../components/NotFound';
import { ProductCard } from '../components/Product/ProductCard';
import { useNotification } from '../components/NotificationContext';
import { ConfirmationDialog } from '../components/ConfirmationDialog';
import type { ProductViewDTO } from '../../../dto/ProductViewDTO';
import { ProductUpdateParam } from '../components/Product/ProductUpdateParam';
import { NavLink } from 'react-router';
import type { ProductCategoryDTO } from '../../../dto/ProductCategoryDTO';

interface Dialog {
    title: string;
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
                console.log('useEffect getProductsByCategory', products);
                setLoading(false);
            })
            .catch((e) => {
                setLoading(false);
                console.log(e);
                notify({ message: 'Помилка отримання продуктів', severity: 'error' });
            });
    }, [categoryName]);

    const updateMainParam = (
        id: number,
        data: {
            unitOperation: 'add' | 'subtract';
            param: number;
        },
    ) => {
        productService
            .updateProductMainParam(id, data)
            .then((product) => {
                setProducts((products) => products.map((i) => (i = i.id === id ? product : i)));
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
    };

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

    const increaseProduct = (product: ProductViewDTO) => {
        setOpenDialog(true);

        setDialogConfig({
            title: 'Збільшити вагу',
            children: (
                <ProductUpdateParam
                    unitOperation="add"
                    onSubmit={(data) => {
                        updateMainParam(product.id, data);
                    }}
                    handleClose={() => {
                        setOpenDialog(false);
                    }}
                    categoryName={product.categoryName}
                />
            ),
        });
    };

    const decreaseProduct = (product: ProductViewDTO) => {
        setOpenDialog(true);

        const getLimit = (): number => {
            let value = 0;

            if (product.categoryName === 'bag') {
                const quantity = product.fields.find((i) => i.name === 'quantity');
                if (!!quantity) value = +quantity.value;
            } else value = product.weight;

            return value;
        };

        setDialogConfig({
            title: 'Зменшити вагу',
            children: (
                <ProductUpdateParam
                    unitOperation="subtract"
                    onSubmit={(data) => {
                        updateMainParam(product.id, data);
                    }}
                    handleClose={() => {
                        setOpenDialog(false);
                    }}
                    limit={getLimit()}
                    categoryName={product.categoryName}
                />
            ),
        });
    };

    const productsList = products.map((product, idx) => {
        const unitText = product.categoryName === 'bag' ? 'Кількість' : 'Вагу';

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
                            <Divider orientation="vertical" sx={{ my: 0.4, width: '100%' }} flexItem />
                            <Stack direction="row" spacing={1} divider={<Divider orientation="vertical" flexItem />}>
                                <Button
                                    size="small"
                                    fullWidth
                                    onClick={() => {
                                        increaseProduct(product);
                                    }}
                                    variant="outlined"
                                >
                                    Додати {unitText}
                                </Button>
                                <Button
                                    size="small"
                                    fullWidth
                                    onClick={() => {
                                        decreaseProduct(product);
                                    }}
                                    variant="outlined"
                                >
                                    Зменшити {unitText}
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
