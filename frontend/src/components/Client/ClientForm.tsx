import { Formik } from 'formik';
import * as Yup from 'yup';
import { Button, Stack, TextField, Card } from '@mui/material';

import { forwardRef } from 'react';
import { InputMask, type InputMaskProps } from '@react-input/mask';
import { BottomBar } from '../BottomBar';
import type { ClientViewDTO } from '../../../../dto/ClientViewDTO';

// Matches the exact format: +38 (0XX) XXX-XX-XX
const ukrainePhoneRegex = /^\+38 \(0\d{2}\) \d{3}-\d{2}-\d{2}$/;

const validationSchema = Yup.object().shape({
    name: Yup.string().min(2, 'Надто коротке!').max(50, 'Надто довге!').required("Поле обов'язкове"),
    phone: Yup.string().matches(ukrainePhoneRegex, 'Невірний формат номера').required("Поле обов'язкове"),
});

// 1. Create a wrapper component for the mask
const UkraineMaskInput = forwardRef<HTMLInputElement, InputMaskProps>((props, ref) => (
    <InputMask {...props} ref={ref} mask="+38 (0__) ___-__-__" replacement={{ _: /\d/ }} />
));

export const ClientForm = ({
    client,
    onSubmit,
}: {
    client: ClientViewDTO;
    onSubmit: (values: ClientViewDTO) => void;
}) => {
    return (
        <Card sx={{ p: 2, mb: 2 }} raised>
            <Formik
                initialValues={client}
                validationSchema={validationSchema}
                enableReinitialize={true}
                onSubmit={onSubmit}
            >
                {({ errors, handleSubmit, values, handleChange }) => (
                    <Stack
                        component={'form'}
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                        }}
                        spacing={2}
                        onSubmit={handleSubmit}
                    >
                        <TextField
                            fullWidth
                            name="name"
                            label="Ім'я"
                            value={values.name}
                            error={!!errors.name}
                            helperText={errors.name}
                            onChange={handleChange}
                        />

                        <TextField
                            name="phone"
                            label="Телефон"
                            value={values.phone}
                            error={!!errors.phone}
                            helperText={errors.phone}
                            onChange={handleChange}
                            variant="outlined"
                            placeholder="+38 (0__) ___-__-__"
                            slotProps={{
                                input: {
                                    inputComponent: UkraineMaskInput as any,
                                },
                            }}
                        />

                        <BottomBar>
                            <Button size={'large'} variant="contained" fullWidth type="submit">
                                Зберегти Клієнта
                            </Button>
                        </BottomBar>
                    </Stack>
                )}
            </Formik>
        </Card>
    );
};
