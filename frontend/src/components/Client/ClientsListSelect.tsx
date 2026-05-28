import { Card, FormControl, InputLabel, Select, MenuItem, Skeleton } from '@mui/material';
import { clientStore } from '../../../store';
import { useEffect } from 'react';
import { ComponentNotFound } from '../ComponentNotFound';

export const ClientsListSelect = () => {
    const { clients, clientId, getClients, setClient, isLoading } = clientStore((s) => s);

    useEffect(() => {
        getClients();
    }, []);

    const List = () =>
        !!clients && !!clients.length ? (
            <FormControl fullWidth margin="dense">
                <InputLabel id={`clientList`}>Список клієнтів</InputLabel>
                <Select
                    aria-labelledby={`clientList`}
                    id={`clientList`}
                    label="Список клієнтів"
                    name="client"
                    value={clientId ?? ''}
                    onChange={(e) => {
                        setClient(e.target.value);
                    }}
                >
                    {clients.map((item, itemIdx) => (
                        <MenuItem key={itemIdx} value={item.id} sx={{ textTransform: 'capitalize' }}>
                            {item.name}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
        ) : (
            <ComponentNotFound title={'Клієнтів не знайдено'} buttonText={'Додати клієнта'} link={'/clients/new'} />
        );

    return isLoading ? <Skeleton variant="rounded" height={58} component={Card} /> : <List />;
};
