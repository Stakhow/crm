import { Box, Backdrop, CircularProgress, Button, Card } from '@mui/material';
import { clientStore } from '../../store';
import { ClientForm } from '../components/Client/ClientForm';
import { ClientsForm } from '../components/Client/ClientsForm';
import { useNavigate } from 'react-router';

export default function ClientPageNew() {
    const { isLoading, contacts, handlePickContacts, saveClient } = clientStore((state) => state);

    const navigate = useNavigate();

    return (
        <Box sx={{ pb: 10 }}>
            {isLoading ? (
                <></>
            ) : (
                <>
                    {!!contacts && !!contacts.length ? (
                        <ClientsForm />
                    ) : (
                        <ClientForm
                            onSubmit={async (values) => {
                                const client = await saveClient(values);
                                if (!!client) navigate(`/clients/${client.id}`);
                            }}
                        />
                    )}

                    <Card sx={{ p: 2, mb: 2 }} raised>
                        <Button
                            size={'large'}
                            variant="outlined"
                            color="primary"
                            fullWidth
                            onClick={handlePickContacts}
                        >
                            Вибрати зі списку контактів
                        </Button>
                    </Card>
                </>
            )}

            <Backdrop sx={(theme: any) => ({ color: '#fff', zIndex: theme.zIndex.drawer + 1 })} open={isLoading}>
                <CircularProgress color="inherit" />
            </Backdrop>
        </Box>
    );
}
