import { Button, Chip, FormControl, TextField } from '@mui/material';
import { orderStore } from '../../../store';

import * as yup from 'yup';
import { useEffect, useState } from 'react';

export const OrderAmountPaid = () => {
    const { amountPaid, setAmountPaid, order, updateAmountPaid } = orderStore((s) => s);
    const [error, setError] = useState<string>();

    console.log(order);

    const userSchema = yup.object({
        amount: yup
            .number()
            .transform((value) => (Number.isNaN(value) ? null : value))
            .nullable()
            .positive('Тільки позитивне число')
            .max(order.amountPaid, `Максимальне значення: ${order.amountPaid}`),
    });

    useEffect(() => {
        console.log('amountPaid', amountPaid);
    }, [amountPaid]);

    const updateAmount = async (amount: string) => {
        setError('');

        try {
            userSchema.validateSync({ amount });
            setAmountPaid(Number(amount));
        } catch (error) {
            if (error instanceof yup.ValidationError) setError(error.message);
        }
    };

    if (order.isPaid) return <Chip sx={{ fontSize: 20 }} label="Замовлення сплачено" color="success" />;

    return (
        <>
            <FormControl margin="dense" fullWidth>
                <TextField
                    name={'amountPaid'}
                    value={!!amountPaid ? amountPaid : ''}
                    onChange={(e) => {
                        updateAmount(e.target.value);
                    }}
                    type={'number'}
                    label={'Оплачено клієнтом (грн.)'}
                    helperText={!!error && error}
                    error={!!error}
                />
            </FormControl>
            {!order.isPaid && amountPaid !== order.totalAmount && (
                <FormControl margin="dense" fullWidth>
                    <Button
                        size={'large'}
                        variant="outlined"
                        fullWidth
                        type={'submit'}
                        onClick={() => {
                            setAmountPaid(order.totalAmount);
                        }}
                    >
                        Оплатити все
                    </Button>
                </FormControl>
            )}

            {!order.isPaid && amountPaid !== order.amountPaid && (
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
