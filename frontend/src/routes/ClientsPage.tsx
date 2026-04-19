import List from '@mui/material/List';
import { useEffect } from 'react';
import { ComponentNotFound } from '../components/ComponentNotFound';
import { ClientItem } from '../components/ClientItem';
import { clientStore } from '../../store';

export default function ClientsPage() {
    const { clients, getClients } = clientStore((state) => state);

    useEffect(() => {
        getClients();
    }, []);

    const ClientsList = () => (
        <List>
            {clients.map((i) => (
                <ClientItem client={i} key={i.id} />
            ))}
        </List>
    );

    return !!clients && !!clients.length ? (
        <ClientsList />
    ) : (
        <ComponentNotFound title={'Клієнтів не знайдено'} buttonText={'Додати клієнта'} link={'/clients/new'} />
    );
}
