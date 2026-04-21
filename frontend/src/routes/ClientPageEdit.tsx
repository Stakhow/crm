import { Box, Backdrop, CircularProgress } from '@mui/material';
import { useParams } from 'react-router';
import { useEffect } from 'react';
import { clientStore } from '../../store';
import { ClientForm } from '../components/Client/ClientForm';

export default function ClientPageEdit() {
    const { id } = useParams();

    const { isLoading, client, getClient } = clientStore((state) => state);

    useEffect(() => {
        getClient(Number(id));
    }, []);

    return (
        <Box sx={{ pb: 10 }}>
            {!isLoading && !!client && <ClientForm />}

            <Backdrop sx={(theme: any) => ({ color: '#fff', zIndex: theme.zIndex.drawer + 1 })} open={isLoading}>
                <CircularProgress color="inherit" />
            </Backdrop>
        </Box>
    );
}
