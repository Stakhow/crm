import { Button, DialogActions, DialogContent, DialogTitle, FormControl, TextField } from '@mui/material';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import type { ProductCategory } from '../../../../backend/domain/product/ProductCategory';
import { useEffect, useRef } from 'react';

export function ProductUpdateQuantity({
    onSubmit,
    handleClose,
    unitOperation,
    categoryName,
    limit,
}: {
    onSubmit: (values: { unitOperation: 'add' | 'subtract'; quantity: number }) => void;
    unitOperation: 'add' | 'subtract';
    categoryName: ProductCategory;
    handleClose: () => void;
    limit?: number;
}) {
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (inputRef.current) {
            inputRef.current?.focus();
        }
    }, []);

    return (
        <Formik
            initialValues={{
                quantity: 0,
                unitOperation,
            }}
            onSubmit={(values) => {
                onSubmit(values);
            }}
            validationSchema={Yup.object().shape({
                quantity: limit
                    ? Yup.number()
                          .positive('Позитивне значення')
                          .max(limit, 'Завелике значення')
                          .required("Поле обов'язкове")
                    : Yup.number().positive('Позитивне значення').required("Поле обов'язкове"),
            })}
            validateOnChange={true}
            validateOnMount={true}
        >
            {({ errors, handleChange }) => (
                <Form>
                    <DialogTitle sx={{ textAlign: 'center' }}>
                        {unitOperation === 'add' ? 'Збільшити' : 'Зменшити'}
                        {categoryName === 'bag' ? ' кількість' : ' вагу'}{' '}
                        {!!limit && limit > 0 && ` (Максимум: ${limit})`}
                    </DialogTitle>
                    <DialogContent>
                        <FormControl margin="dense" fullWidth>
                            <TextField
                                inputRef={inputRef}
                                autoFocus
                                name="quantity"
                                type="number"
                                onChange={handleChange}
                                helperText={errors.quantity}
                                error={!!errors.quantity}
                            />
                        </FormControl>
                    </DialogContent>
                    <DialogActions sx={{ p: 3, pt: 0 }}>
                        <Button variant="outlined" fullWidth onClick={handleClose}>
                            Відміна
                        </Button>
                        <Button
                            variant="outlined"
                            disabled={!!errors.quantity}
                            fullWidth
                            color={'success'}
                            type="submit"
                        >
                            Підтвердити
                        </Button>
                    </DialogActions>
                </Form>
            )}
        </Formik>
    );
}
