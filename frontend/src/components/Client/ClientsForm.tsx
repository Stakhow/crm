import { FieldArray, Formik, getIn } from 'formik';
import { Button, Stack, TextField, Card } from '@mui/material';
import { BottomBar } from '../BottomBar';
import { clientStore } from '../../../store';
import { useNavigate } from 'react-router';
import { ClientsList } from './ClientsLIst';
import { UkraineMaskInput } from './InputMask';
import { validationSchemaBulk } from './validationSchema';

export const ClientsForm = () => {
    const { contacts, clients, saveClients } = clientStore((s) => s);

    const navigate = useNavigate();

    return (
        <>
            <Card sx={{ p: 2, mb: 2 }} raised>
                <Formik
                    initialValues={{ clients: clients }}
                    validationSchema={validationSchemaBulk}
                    enableReinitialize={true}
                    onSubmit={async () => {
                        const clients = await saveClients();
                        if (!!clients && !!clients.length) navigate(`/clients`);
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
                            <FieldArray
                                name={'clients'}
                                render={() => (
                                    <>
                                        {values.clients &&
                                            values.clients.map((client) => {
                                                const errorName = getIn(errors, client.name);
                                                const errorPhone = getIn(errors, client.phone);

                                                return (
                                                    <>
                                                        <TextField
                                                            fullWidth
                                                            name="name"
                                                            label="Ім'я"
                                                            value={client.name}
                                                            error={!!errorName}
                                                            helperText={errorName}
                                                            onChange={handleChange}
                                                        />

                                                        <TextField
                                                            name="phone"
                                                            label="Телефон"
                                                            type="tel"
                                                            value={client.phone}
                                                            error={!!errorPhone}
                                                            helperText={errorPhone}
                                                            onChange={handleChange}
                                                            variant="outlined"
                                                            placeholder="+38 (0__) ___-__-__"
                                                            slotProps={{
                                                                input: {
                                                                    inputComponent: UkraineMaskInput as any,
                                                                },
                                                            }}
                                                        />
                                                    </>
                                                );
                                            })}
                                    </>
                                )}
                            ></FieldArray>

                            <ClientsList clients={contacts} />

                            <BottomBar>
                                <Button size={'large'} variant="contained" fullWidth type="submit">
                                    Зберегти Клієнтів
                                </Button>
                            </BottomBar>
                        </Stack>
                    )}
                </Formik>
            </Card>
        </>
    );
};
