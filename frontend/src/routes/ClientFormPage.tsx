import { Formik } from 'formik';
import * as Yup from 'yup';
import { Button, Stack, Box, TextField, Card } from '@mui/material';
import { NavLink, useNavigate, useParams } from 'react-router';
import { useNotification } from '../components/NotificationContext';
import { clientService } from '../../../backend/index';
import { forwardRef, useEffect, useState } from 'react';
import type { ClientDTO } from '../../../dto/ClientDTO';
import { InputMask, type InputMaskProps } from '@react-input/mask';

// Matches the exact format: +38 (0XX) XXX-XX-XX
const ukrainePhoneRegex = /^\+38 \(0\d{2}\) \d{3}-\d{2}-\d{2}$/;

const DisplayingErrorMessagesSchema = Yup.object().shape({
    name: Yup.string().min(2, 'Надто коротке!').max(50, 'Надто довге!').required("Поле обов'язкове"),
    phone: Yup.string().matches(ukrainePhoneRegex, 'Невірний формат номера').required("Поле обов'язкове"),
});

// 1. Create a wrapper component for the mask
const UkraineMaskInput = forwardRef<HTMLInputElement, InputMaskProps>((props, ref) => (
    <InputMask {...props} ref={ref} mask="+38 (0__) ___-__-__" replacement={{ _: /\d/ }} />
));

export default function ClientFormPage() {
    const { notify } = useNotification();
    const { id } = useParams();
    const navigate = useNavigate();

    const [client, setClient] = useState<ClientDTO>({
        id: 0,
        name: '',
        phone: '',
    });

    // EDIT MODE
    if (id)
        useEffect(() => {
            clientService.getById(+id).then((client) => {
                setClient(client);
            });
        }, []);

    return (
        <Card sx={{ p: 2, mb: 2 }} raised>
            <Formik
                initialValues={client}
                validationSchema={DisplayingErrorMessagesSchema}
                enableReinitialize={true}
                onSubmit={async (values) => {
                    await clientService
                        .save(values)
                        .then((newClientId) => {
                            const message = id ? 'відредаговано' : 'додано';

                            notify({ message: `Клієнта ${message}`, severity: 'success' });
                            navigate(`/clients/${newClientId}`);
                        })
                        .catch((error) => {
                            console.error(error);
                            notify({ message: `Помилка: ${error.message}`, severity: 'error' });
                        });
                }}
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

                        <Button type="submit" variant="contained">
                            Зберегти
                        </Button>
                    </Stack>
                )}
            </Formik>

            <Box m={3} textAlign={'center'}>
                <Button component={NavLink} to={'/clients'}>
                    До списку клієнтів
                </Button>
            </Box>
        </Card>
    );
}
