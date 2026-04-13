import { Formik } from 'formik';
import * as Yup from 'yup';
import { Button, Stack, Box, TextField, Paper } from '@mui/material';
import { Link, useParams } from 'react-router';
import { useNotification } from '../components/NotificationContext';
import { clientService } from '../../../backend/index';
import { useEffect, useState } from 'react';
import type { ClientDTO } from '../../../dto/ClientDTO';

const DisplayingErrorMessagesSchema = Yup.object().shape({
    name: Yup.string().min(2, 'Надто коротке!').max(50, 'Надто довге!').required("Поле обов'язкове"),
    phone: Yup.string()
        .matches(/^\+\d{12}$/, 'Невірний формат')
        .required("Поле обов'язкове"),
});

export default function ClientForm() {
    const { notify } = useNotification();
    const { id } = useParams();

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
        <Paper sx={{ p: 2, mb: 2 }}>
            <Formik
                initialValues={client}
                validationSchema={DisplayingErrorMessagesSchema}
                enableReinitialize={true}
                onSubmit={(values, { setSubmitting, resetForm }) => {
                    clientService
                        .save(values)
                        .then(() => {
                            const message = id ? 'відредаговано' : 'додано';

                            notify({ message: `Клієнта ${message}`, severity: 'success' });
                            resetForm();
                            setClient({
                                id: 0,
                                name: '',
                                phone: '',
                            });
                            setSubmitting(false);
                        })
                        .catch((error) => {
                            console.error(error);
                            notify({ message: `Помилка: ${error.message}`, severity: 'error' });
                            setSubmitting(false);
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
                            fullWidth
                            type="tel"
                            name="phone"
                            label="Телефон"
                            value={values.phone}
                            error={!!errors.phone}
                            helperText={errors.phone}
                            onChange={handleChange}
                        />

                        <Button type="submit" variant="contained">
                            Зберегти
                        </Button>
                    </Stack>
                )}
            </Formik>

            <Box m={3} textAlign={'center'}>
                <Link to={'/clients'}>
                    <Button>До списку клієнтів</Button>
                </Link>
            </Box>
        </Paper>
    );
}
