import List from '@mui/material/List';
import { useEffect, useState } from 'react';
import { useNotification } from '../components/NotificationContext';
import { clientService } from '../../../backend/index';
import type { ClientViewDTO } from '../../../dto/ClientViewDTO';
import { ComponentNotFound } from '../components/ComponentNotFound';
import { ClientItem } from '../components/ClientItem';

export default function ClientsPage() {
    const [list, setList] = useState<ClientViewDTO[]>([]);

    const { notify } = useNotification();

    useEffect(() => {
        clientService
            .getAll()
            .then((list) => {
                setList(list);
            })
            .catch((e) => {
                console.error(e);
                notify({ message: 'Помилка отримання списку', severity: 'error' });
            });
    }, []);

    const ClientsList = () => (
        <List>
            {list.map((i) => (
                <ClientItem client={i} key={i.id} />
            ))}
        </List>
    );

    return !!list.length ? (
        <ClientsList />
    ) : (
        <ComponentNotFound title={'Клієнтів не знайдено'} buttonText={'Додати клієнта'} link={'/clients/new'} />
    );
}
