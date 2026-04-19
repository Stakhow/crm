import { Card, FormControl, InputLabel, Select, MenuItem, Skeleton } from '@mui/material';
import { cartStore, clientStore } from '../../../store';
import { useEffect } from 'react';
import { ComponentNotFound } from '../ComponentNotFound';

export const ClientsListSelect = () => {
    const { clients, clientId, getClients, setClient, isLoading } = clientStore((s) => s);
    const { cart } = cartStore((s) => s);

    const isCartExist = !!cart && !!cart.clientId;
    const _clientId = isCartExist ? cart.clientId : clientId;

    useEffect(() => {
        getClients();
    }, []);

    const List = () =>
        !!clients && !!clients.length ? (
            <Card sx={{ p: 2 }} raised>
                <FormControl fullWidth margin="dense">
                    <InputLabel id={`clientList`}>Список клієнтів</InputLabel>
                    <Select
                        disabled={isCartExist}
                        aria-labelledby={`clientList`}
                        id={`clientList`}
                        label="Список клієнтів"
                        name="client"
                        value={_clientId ?? ''}
                        onChange={(e) => {
                            console.log(e.target.value);
                            setClient(e.target.value);
                        }}
                        // error={!!errors.client}
                    >
                        {clients.map((item, itemIdx) => (
                            <MenuItem key={itemIdx} value={item.id} sx={{ textTransform: 'capitalize' }}>
                                {item.name}
                            </MenuItem>
                        ))}
                    </Select>

                    {/* <FormHelperText error={!!errors.client}>{errors.client}</FormHelperText> */}
                </FormControl>
            </Card>
        ) : (
            <ComponentNotFound title={'Клієнтів не знайдено'} buttonText={'Додати клієнта'} link={'/clients/new'} />
        );

    return isLoading ? <Skeleton variant="rounded" height={102} component={Card} /> : <List />;
};
