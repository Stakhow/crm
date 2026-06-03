import { create } from 'zustand';
import { AppError } from '../../utils/error';
import { notify } from './NotificationStore';
import { devtools } from 'zustand/middleware';
import type { ClientCreateDTO, ClientViewDTO } from '../../dto/ClientViewDTO';
import { clientService } from '../../backend';
import { generateId } from '../../utils/utils';

interface ContactInfo {
    address?: any[];
    email?: string[];
    icon?: any[];
    name?: string[];
    tel?: string[];
}

interface ClientState {
    isLoading: boolean;
    error: string;
    clientFields: ClientCreateDTO;
    client: ClientViewDTO;
    clientId: string;
    clients: ClientViewDTO[];
    contacts: ClientViewDTO[];
    getClient: (clientId: string) => ClientViewDTO;
    setClient: (clientId: string) => void;
    getClients: () => ClientViewDTO[];
    deleteClient: (clientId: string) => void;
    saveClient: (data: ClientCreateDTO) => ClientViewDTO;
    saveClients: () => ClientViewDTO[];
    handlePickContacts: () => void;
}

const name = 'clientStore';
export const clientStore = create<ClientState>()(
    devtools(
        (set, get) => {
            const handleRequest = async (
                actionName: string,
                errorMessage: string,
                requestFn: () => Promise<any>,
                onStartInit: Partial<ClientState> = { isLoading: true, error: '' },
            ): Promise<any> => {
                set(onStartInit, false, `${name}/${actionName}:start`);
                try {
                    return await requestFn();
                } catch (error: unknown) {
                    console.log(error);
                    const msg = error instanceof AppError ? error.message : 'Невідома помилка';
                    set({ error: msg, isLoading: false }, false, `${name}/${actionName}:error`);
                    notify.error(`${errorMessage}: ${get().error}`);
                    throw error;
                }
            };

            return {
                isLoading: false,
                error: '',
                clientFields: {
                    name: '',
                    phone: '',
                },
                client: undefined,
                clients: undefined,
                contacts: [],

                getClient: (clientId) =>
                    handleRequest(
                        'getClient',
                        'Клієнта не існує',
                        async () => {
                            const client = await clientService.getByIdToView(clientId);
                            if (!!client.id) client.phone = formatPhoneForUI(client.phone);
                            set({ client, isLoading: false, error: '' }, false, `${name}/getClient:success`);
                        },
                        { isLoading: true, client: undefined, error: '' },
                    ),

                setClient: (clientId) => {
                    set({ clientId });
                },

                getClients: () =>
                    handleRequest(
                        'getClients',
                        'Помилка отрмання списку клієнтів',
                        async () => {
                            const clientsDB = await clientService.getAll();
                            const clients: ClientViewDTO[] = clientsDB.map((i) => ({
                                ...i,
                                phone: formatPhoneForUI(i.phone),
                            }));
                            set({ isLoading: false, clients, error: '' }, false, `${name}/getClients:start`);
                        },
                        { isLoading: true, clients: undefined, error: '' },
                    ),

                deleteClient: (clientId) =>
                    handleRequest(
                        'deleteClient',
                        'Помилка видалення клієнта',
                        async () => {
                            await clientService.delete(clientId);
                            set(
                                { client: undefined, isLoading: false, error: '' },
                                false,
                                `${name}/deleteClient:success`,
                            );
                            notify.success(`Клієнта видалено`);
                        },
                        { client: undefined, isLoading: true, error: '' },
                    ),

                saveClient: (data) =>
                    handleRequest('saveClient', 'Помилка збереження клієнта', async () => {
                        const saveClient = await clientService.create(data);
                        set(
                            { client: saveClient, contacts: [], isLoading: false, error: '' },
                            false,
                            `${name}/saveClient:success`,
                        );
                        notify.success(`Клієнта збережено`);

                        return saveClient;
                    }),

                saveClients: () =>
                    handleRequest('saveClients', 'Помилка збереження клієнтів', async () => {
                        const savedClients = await clientService.saveBulk(get().contacts);
                        set(
                            { clients: [], contacts: [], isLoading: false, error: '' },
                            false,
                            `${name}/saveClients:success`,
                        );
                        notify.success(`Клієнтів успішно збережено`);

                        return savedClients;
                    }),

                handlePickContacts: async () => {
                    const supported = 'contacts' in navigator && 'ContactsManager' in window;
                    if (supported) {
                        return handleRequest(
                            'saveClients',
                            'Помилка збереження клієнтів',
                            async () => {
                                const props = ['name', 'tel'];
                                const options = { multiple: true };
                                //@ts-ignore
                                const selectedContacts: ContactInfo[] = await navigator.contacts.select(props, options);
                                set({
                                    contacts: selectedContacts.map((i) => fromContactToClientMapper(i)),
                                });
                            },
                            { isLoading: true, error: '' },
                        );
                    } else {
                        console.log('Contact Picker API is not supported on this browser.');
                        notify.error(`Contact Picker API не підтримується в цьому браузері`);
                    }
                },
            };
        },
        { name, enabled: false },
    ),
);

function formatPhoneForUI(phone: string) {
    let cleaned = ('' + phone).replace(/\D/g, '');

    if (cleaned.startsWith('38')) {
        cleaned = cleaned.substring(2);
    }

    const match = cleaned.match(/^0\d{9}$/);

    if (match) {
        return `+38 (0${cleaned.substring(1, 3)}) ${cleaned.substring(3, 6)}-${cleaned.substring(6, 8)}-${cleaned.substring(8, 10)}`;
    } else throw new AppError('DOMAIN', 'Помилка формату номера телефону');
}

function fromContactToClientMapper(client: ContactInfo): ClientViewDTO {
    const name = !!client.name && client.name.length === 1 ? client.name[0] : '';
    const phone = !!client.tel && client.tel.length === 1 ? client.tel[0] : '';

    return {
        id: generateId(),
        name: name,
        phone: formatPhoneForUI(phone),
        createdAt: 0,
        updatedAt: 0,
    };
}
