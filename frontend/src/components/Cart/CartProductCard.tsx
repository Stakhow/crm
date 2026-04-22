import { FormControl, Button, TextField } from '@mui/material';
import { priceFormat } from '../../../../utils/utils';
import { ProductCard } from '../Product/ProductCard';
import { useState, type ComponentType } from 'react';
import type { ProductViewDTO } from '../../../../dto/ProductViewDTO';
import type React from 'react';
import { cartStore, clientStore, productStore } from '../../../store';
import { useFormikContext } from 'formik';
import type { OrderFormValues } from '../../routes/OrderNewPage';

interface WithLoaderProps {
    children?: React.ReactNode;
    product: ProductViewDTO;
}

function withCart<P extends object>(WrappedComponent: ComponentType<P>): React.FC<P & WithLoaderProps> {
    return ({ ...props }: WithLoaderProps) => {
        const { product } = props;

        const { getProductAmount } = productStore((s) => s);
        const { isLoading, addCartItem } = cartStore((s) => s);
        const { values, handleChange, errors } = useFormikContext<OrderFormValues>();
        const { clientId } = clientStore((s) => s);

        const [amount, setAmount] = useState(0);

        return (
            <WrappedComponent {...(props as P)}>
                {!!product.isAvailable && (
                    <>
                        <FormControl margin="dense" fullWidth>
                            <TextField
                                name={'quantity'}
                                value={values.quantity != 0 ? values.quantity : ''}
                                type={'number'}
                                label={product.categoryName === 'bag' ? 'Кількість (шт.)' : 'Вага (кг)'}
                                onChange={async (e: React.ChangeEvent<any>) => {
                                    handleChange(e);
                                    setAmount(0);

                                    const newAmount = await getProductAmount(values.id, Number(e.target.value));

                                    setAmount(newAmount);
                                }}
                                helperText={errors['quantity']}
                                error={!!errors['quantity']}
                            />
                        </FormControl>

                        <FormControl margin="dense" fullWidth>
                            <Button
                                size="large"
                                variant="outlined"
                                fullWidth
                                color="success"
                                onClick={async () => {
                                    addCartItem({ productId: product.id, quantity: values.quantity, clientId });
                                }}
                                disabled={isLoading || !!errors['quantity']}
                            >
                                В корзину {!!amount && `| ${priceFormat(amount)}`}
                            </Button>
                        </FormControl>
                    </>
                )}
            </WrappedComponent>
        );
    };
}

export const CartProductCard = withCart(ProductCard);
