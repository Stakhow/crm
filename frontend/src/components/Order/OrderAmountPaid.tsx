import { Button, Chip, FormControl, TextField } from '@mui/material';
import { orderStore } from '../../../store';

import * as yup from 'yup';
import { useState } from 'react';

export const OrderAmountPaid = () => {
    const { amountPaid, setAmountPaid, order, updateAmountPaid } = orderStore((s) => s);
    const [error, setError] = useState<string>();

    const userSchema = yup.object({
        amount: yup
            .number()
            .transform((value) => (Number.isNaN(value) ? null : value))
            .nullable()
            .positive('Тільки позитивне число')
            .max(order.totalAmount, `Максимальне значення: ${order.totalAmount}`),
    });

    const updateAmount = async (amount: number) => {
        setError('');

        try {
            userSchema.validateSync({ amount });
        } catch (error) {
            console.log(error);

            if (error instanceof yup.ValidationError) setError(error.message);
        }

        setAmountPaid(amount);
    };

    if (order.paid) return <Chip sx={{ fontSize: 20 }} label="Замовлення сплачено" color="success" />;

    return (
        <>
            <FormControl margin="dense" fullWidth>
                <TextField
                    name={'amountPaid'}
                    value={!!amountPaid ? amountPaid : ''}
                    onChange={(e) => {
                        updateAmount(+e.target.value);
                    }}
                    type={'number'}
                    label={'Оплачено клієнтом (грн.)'}
                    helperText={!!error && error}
                    error={!!error}
                />
            </FormControl>
            {!order.paid && amountPaid !== order.totalAmount && (
                <FormControl margin="dense" fullWidth>
                    <Button
                        size={'large'}
                        variant="outlined"
                        fullWidth
                        type={'submit'}
                        onClick={() => {
                            updateAmount(order.totalAmount);
                        }}
                    >
                        Оплатити все
                    </Button>
                </FormControl>
            )}

            {!order.paid && amountPaid !== order.amountPaid && (
                <FormControl margin="dense" fullWidth>
                    <Button
                        size={'large'}
                        variant="outlined"
                        color="success"
                        fullWidth
                        type={'submit'}
                        onClick={updateAmountPaid}
                    >
                        Зберегти
                    </Button>
                </FormControl>
            )}
        </>
    );
};
