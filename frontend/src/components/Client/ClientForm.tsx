import { Formik } from 'formik';
import { Button, Stack, TextField, Card } from '@mui/material';
import { BottomBar } from '../BottomBar';
import { clientStore } from '../../../store';
import { UkraineMaskInput } from './InputMask';
import { validationSchema } from './validationSchema';
import type { ClientCreateDTO } from '../../../../dto/ClientViewDTO';

export const ClientForm = ({ onSubmit }: { onSubmit: (values: ClientCreateDTO) => void }) => {
    const { client } = clientStore((s) => s);

    return (
        <Card sx={{ p: 2, mb: 2 }} raised>
            <Formik
                initialValues={{
                    name: !!client ? client.name : '',
                    phone: !!client ? client.phone : '',
                }}
                validationSchema={validationSchema}
                enableReinitialize={true}
                onSubmit={onSubmit}
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
    );
};
