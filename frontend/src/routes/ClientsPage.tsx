import { useEffect } from 'react';
import { clientStore } from '../../store';
import { NavLink } from 'react-router';
import { BottomBar } from '../components/BottomBar';
import { Backdrop, Box, Button, CircularProgress } from '@mui/material';
import { ClientsList } from '../components/Client/ClientsLIst';

export default function ClientsPage() {
    const { isLoading, clients, getClients } = clientStore((state) => state);

    useEffect(() => {
        getClients();
    }, []);

    return (
        <Box sx={{ pb: 10 }}>
            <ClientsList clients={clients} />

            <BottomBar>
                <Button size={'large'} variant="contained" fullWidth component={NavLink} to={'/clients/new'}>
                    Додати клієнта
                </Button>
            </BottomBar>

            <Backdrop sx={(theme: any) => ({ color: '#fff', zIndex: theme.zIndex.drawer + 1 })} open={isLoading}>
                <CircularProgress color="inherit" />
            </Backdrop>
        </Box>
    );
}
