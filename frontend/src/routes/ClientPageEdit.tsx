import { Box, Backdrop, CircularProgress } from '@mui/material';
import { useNavigate, useParams, useLocation } from 'react-router';
import { useEffect } from 'react';
import { clientStore } from '../../store';
import { ClientForm } from '../components/Client/ClientForm';
import type { ClientViewDTO } from '../../../dto/ClientViewDTO';

export default function ClientPageEdit() {
    const { id } = useParams();
    const location = useLocation();
    console.log(useParams());
    console.log(location);

    const navigate = useNavigate();

    const { isLoading, client, getClient, saveClient } = clientStore((state) => state);

    useEffect(() => {
        getClient(Number(id));
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
