import { List, Stack } from '@mui/material';
import type { ClientViewDTO } from '../../../../dto/ClientViewDTO';
import { ClientItem } from './ClientItem';
import { ComponentNotFound } from '../ComponentNotFound';

export const ClientsList = ({ clients }: { clients: ClientViewDTO[] }) => {
    return !!clients && !!clients.length ? (
        <List component={Stack} spacing={1}>
            {clients.map((i) => (
                <ClientItem client={i} key={i.id} />
            ))}
        </List>
    ) : (
        <ComponentNotFound title={'Клієнтів не знайдено'} buttonText={'Додати клієнта'} link={'/clients/new'} />
    );
};
