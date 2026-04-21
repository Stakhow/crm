import { Box, Backdrop, CircularProgress, Button } from '@mui/material';
import { useEffect } from 'react';
import { clientStore } from '../../store';
import { ClientForm } from '../components/Client/ClientForm';
import { ClientsForm } from '../components/Client/ClientsForm';

export default function ClientPageNew() {
    const { isLoading, client, contacts, getClient, handlePickContacts } = clientStore((state) => state);

    useEffect(() => {
        getClient(0);
    }, []);

    return (
        <Box sx={{ pb: 10 }}>
            {isLoading ? (
                <></>
            ) : (
                <>
                    {!!contacts && !!contacts.length ? <ClientsForm /> : <>{!!client && <ClientForm />}</>}

                    <Button size={'large'} variant="outlined" color="primary" fullWidth onClick={handlePickContacts}>
                        Вибрати зі списку контактів
                    </Button>
                </>
            )}

            <Backdrop sx={(theme: any) => ({ color: '#fff', zIndex: theme.zIndex.drawer + 1 })} open={isLoading}>
                <CircularProgress color="inherit" />
            </Backdrop>
        </Box>
    );
}
