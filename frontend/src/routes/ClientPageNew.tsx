import { Box, Backdrop, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router';
import { useEffect } from 'react';
import { clientStore } from '../../store';
import { ClientForm } from '../components/Client/ClientForm';
import type { ClientViewDTO } from '../../../dto/ClientViewDTO';

export default function ClientPageNew() {
    const navigate = useNavigate();

    const { isLoading, client, getClient, saveClient } = clientStore((state) => state);

    useEffect(() => {
        getClient(0);
    }, []);

    return (
        <Box>
            {!isLoading && !!client && (
                <ClientForm
                    client={client}
                    onSubmit={async (values: ClientViewDTO) => {
                        const client = await saveClient(values);
                        if (!!client && !!client.id) navigate(`/clients/${client.id}`, { replace: true });
                    }}
                />
            )}

            <Backdrop sx={(theme: any) => ({ color: '#fff', zIndex: theme.zIndex.drawer + 1 })} open={isLoading}>
                <CircularProgress color="inherit" />
            </Backdrop>
        </Box>
    );
}
