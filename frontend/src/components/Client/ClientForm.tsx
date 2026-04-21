import { Formik } from 'formik';
import { Button, Stack, TextField, Card } from '@mui/material';
import { BottomBar } from '../BottomBar';
import type { ClientViewDTO } from '../../../../dto/ClientViewDTO';
import { clientStore } from '../../../store';
import { useNavigate } from 'react-router';
import { UkraineMaskInput } from './InputMask';
import { validationSchema } from './validationSchema';

export const ClientForm = () => {
    const { client, saveClient } = clientStore((s) => s);

    const navigate = useNavigate();

    return (
        <>
            <Card sx={{ p: 2, mb: 2 }} raised>
                <Formik
                    initialValues={client}
                    validationSchema={validationSchema}
                    enableReinitialize={true}
                    onSubmit={async (values: ClientViewDTO) => {
                        const client = await saveClient(values);
                        if (!!client && !!client.id) navigate(`/clients/${client.id}`);
                    }}
                >
                    {({ errors, handleSubmit, values, handleChange }) => (
                        <Stack
                            direction={'column'}
                            justifyContent={'center'}
                            component={'form'}
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
                                type="tel"
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
        </>
    );
};
