import {
    Box,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Typography,
    Stack,
    Button,
    TextField,
    Chip,
} from '@mui/material';
import { Field, FieldArray, useField, useFormikContext, type FieldHookConfig, getIn } from 'formik';

import { ProductCard } from '../Product/ProductCard';
import type { ProductViewDTO } from '../../../../dto/ProductViewDTO';
import type { OrderFormValues } from '../../routes/OrderNew';
import { useEffect, useState } from 'react';
import { priceFormat } from '../../../../utils/utils';

type ProductQuantityFieldProps = FieldHookConfig<string> & {
    label: string;
};

const ProductQuantityField = ({ ...props }: ProductQuantityFieldProps) => {
    const [field, meta, helpers] = useField(props);

    return (
        <FormControl margin="dense" fullWidth>
            <Field
                component={TextField}
                type="number"
                error={meta.touched && Boolean(meta.error)}
                helperText={meta.touched && meta.error}
                onFocus={(e: React.ChangeEvent<any>) => {
                    if (+e.target.value === 0) helpers.setValue('', false);
                }}
                {...field}
                {...props}
            />
        </FormControl>
    );
};

type SelectedProductCardProps = {
    index: number;
    product: ProductViewDTO;
    isProductInCart: boolean;
    addCartItem: ({ productId, quantity, clientId }: { productId: number; quantity: number; clientId: number }) => void;
    deleteCartItem: (id: number) => void;
    calcAmount: (id: number, quantity: number) => Promise<{ sum: number; isValid: boolean }>;
};

type ListItemKey = keyof OrderFormValues['list'][number];

const SelectedProductCard = ({
    index,
    product,
    isProductInCart,
    addCartItem,
    deleteCartItem,
    calcAmount,
}: SelectedProductCardProps) => {
    const { setFieldValue, values, errors, setSubmitting, isValid } = useFormikContext<OrderFormValues>();
    const [amount, setAmount] = useState<number>(0);

    const weightError = getIn(errors, `list.${index}.weight`);
    const weightValue = getIn(values, `list.${index}.weight`);
    const idValue = getIn(values, `list.${index}.id`);

    useEffect(() => {
        if (!weightError) {
            setSubmitting(true);
            calcAmount(product.id, weightValue)
                .then((data) => {
                    setSubmitting(false);
                    setAmount(data.sum);
                })
                .catch(() => {
                    setSubmitting(false);
                });
        } else setAmount(0);
    }, [weightValue, weightError]);

    useEffect(() => {
        setFieldValue(`list.${index}.stock`, product.weight, false);
        if (!isProductInCart) {
            setFieldValue(`list.${index}.weight`, '', false);
        }
    }, [idValue]);

    return (
        <ProductCard product={product}>
            <Stack direction={'column'} p={2}>
                {Number(product.weight) > 0 ? (
                    <ProductQuantityField
                        name={`list.${index}.weight`}
                        id={`list.${index}.weight`}
                        label={product.categoryName === 'bag' ? 'Кількість' : 'Вага'}
                        disabled={isProductInCart}
                    />
                ) : (
                    <Typography textAlign={'center'} color="error" gutterBottom={true}>
                        Продукт Закінчився
                    </Typography>
                )}

                {isProductInCart ? (
                    <Typography textAlign={'center'} variant="h6" gutterBottom={true}>
                        Сума: {priceFormat(amount)}
                    </Typography>
                ) : (
                    <FormControl margin="dense" fullWidth>
                        <Button
                            size={'small'}
                            variant="outlined"
                            fullWidth
                            color="success"
                            onClick={() => {
                                addCartItem({
                                    productId: product.id,
                                    quantity: weightValue,
                                    clientId: values.client,
                                });
                            }}
                            disabled={!!weightError}
                        >
                            В корзину {!!amount && `| ${priceFormat(amount)}`}
                        </Button>
                    </FormControl>
                )}

                <FormControl margin="dense" fullWidth>
                    <Button
                        size={'small'}
                        variant="outlined"
                        fullWidth
                        color="error"
                        onClick={() => {
                            setFieldValue(
                                `list`,
                                values.list.filter((_, idx) => idx !== index),
                                false,
                            );
                            if (isProductInCart) {
                                deleteCartItem(product.id);
                            }
                        }}
                    >
                        Видалити {isProductInCart ? `з корзини` : `зі списку`}
                    </Button>
                </FormControl>
            </Stack>
        </ProductCard>
    );
};

type ProductSelectProps = {
    label: string;
    products: ProductViewDTO[];
    productsInCart: number[];
    addCartItem: (data: { productId: number; quantity: number; clientId: number }) => void;
    deleteCartItem: (id: number) => void;
    calcAmount: (id: number, quantity: number) => Promise<{ sum: number; isValid: boolean }>;
    client: number;
    index: number;
} & FieldHookConfig<string>;

export const ProductSelect = ({
    label,
    products,
    productsInCart,
    addCartItem,
    deleteCartItem,
    calcAmount,
    index,
    client,
    ...props
}: ProductSelectProps) => {
    const [field, meta, helpers] = useField(props);
    const selectedProductId = field.value ?? '';

    const options = products.map((item, itemIdx) => (
        <MenuItem key={itemIdx} value={item.id} disabled={productsInCart.includes(item.id)}>
            {item.name} ID:
            {item.id}
            {productsInCart.includes(item.id) && <Chip sx={{ ml: 1 }} label="Уже в корзині" />}
        </MenuItem>
    ));

    const product = !!selectedProductId ? products.find((i) => +selectedProductId === i.id) : undefined;

    return (
        <>
            <FormControl fullWidth margin="dense">
                <InputLabel>{label}</InputLabel>
                <Select id={field.name} value={selectedProductId} {...props}>
                    {options}
                </Select>
            </FormControl>

            {product && (
                <SelectedProductCard
                    isProductInCart={productsInCart.includes(product.id)}
                    index={index}
                    product={product}
                    addCartItem={addCartItem}
                    calcAmount={calcAmount}
                    deleteCartItem={() => {
                        deleteCartItem(product.id);
                    }}
                />
            )}
        </>
    );
};
