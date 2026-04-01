import { useEffect, useState, type ReactNode } from 'react';
import { productService } from '../../../backend';
import { Categories } from '../components/Categories';
import type { ProductCategory } from '../../../backend/domain/product/ProductCategory';
import { Box, CardActions, CircularProgress, Divider, Fab, Stack, Typography } from '@mui/material';
import { NotFoundImg } from '../components/NotFound';
import { ProductCard } from '../components/Product/ProductCard';
import { useNotification } from '../components/NotificationContext';
import { ConfirmationDialog } from '../components/ConfirmationDialog';
import type { ProductViewDTO } from '../../../dto/ProductViewDTO';
import { ProductUpdateParam } from '../components/Product/ProductUpdateParam';
import { NavLink } from 'react-router';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import DeleteIcon from '@mui/icons-material/Delete';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';

interface Dialog {
    title: string;
    message?: string;
    children?: ReactNode;
    handleConfirmClick?: () => void;
}

export default function Products() {
    const [products, setProducts] = useState<ProductViewDTO[]>([]);
    const [isLoading, setLoading] = useState<boolean>(false);
    const [categoryName, setCategoryName] = useState<ProductCategory | ''>('');
    const [categories, setCategories] = useState<{ name: ProductCategory; title: string }[]>([]);
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
        setTimeout(() => {
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
        }, 1000);
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

    const productsList = products.map((product, idx) => (
        <ProductCard
            key={idx}
            product={product}
            children={
                <CardActions sx={{ p: 2 }}>
                    <Stack direction="row" spacing={2} divider={<Divider orientation="vertical" flexItem />}>
                        <Fab
                            component={NavLink}
                            to={`${product.id}`}
                            color="primary"
                            size="small"
                            children={<RemoveRedEyeIcon fontSize="medium" />}
                        />

                        <Fab
                            color="error"
                            size="small"
                            children={<DeleteIcon fontSize="medium" />}
                            onClick={() => {
                                deleteProduct(product.id);
                            }}
                        />
                        <Fab
                            color="primary"
                            size="small"
                            children={<AddIcon fontSize="medium" />}
                            onClick={() => {
                                increaseProduct(product);
                            }}
                        />
                        <Fab
                            color="primary"
                            size="small"
                            children={<RemoveIcon fontSize="medium" />}
                            onClick={() => {
                                decreaseProduct(product);
                            }}
                        />
                    </Stack>
                </CardActions>
            }
        />
    ));

    return (
        <div>
            <Categories
                categories={categories}
                value={categoryName}
                onChange={(e: React.ChangeEvent<any>) => {
                    setCategoryName(e.target.value);
                }}
            />

            {isLoading ? (
                <Box my={3} sx={{ textAlign: 'center' }}>
                    <CircularProgress size="3rem" />
                </Box>
            ) : !!products.length ? (
                productsList
            ) : (
                !!categoryName && (
                    <Box>
                        <Typography mt={3} textAlign={'center'} variant="h5">
                            Продуктів не знайдено
                        </Typography>
                        <NotFoundImg />
                    </Box>
                )
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
        </div>
    );
}
