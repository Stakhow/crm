import { create } from 'zustand';
import { AppError } from '../../utils/error';
import { notify } from './NotificationStore';
import { devtools } from 'zustand/middleware';
import type { ClientViewDTO } from '../../dto/ClientViewDTO';
import { clientService } from '../../backend';

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
    client: ClientViewDTO;
    clientId: number;
    clients: ClientViewDTO[];
    contacts: ClientViewDTO[];
    getClient: (clientId: number) => ClientViewDTO;
    setClient: (clientId: number) => void;

    getClients: () => ClientViewDTO[];
    deleteClient: (clientId: number) => void;
    saveClient: (client: ClientViewDTO) => ClientViewDTO;
    saveClients: () => ClientViewDTO[];
    handlePickContacts: () => void;
}

const name = 'clientStore';
export const clientStore = create<ClientState>()(
    devtools(
        (set, get) => ({
            isLoading: false,
            error: '',
            client: undefined,
            clients: undefined,
            contacts: [],

            getClient: async (clientId) => {
                set(
                    {
                        isLoading: true,
                        client: undefined,
                        error: '',
                    },
                    false,
                    `${name}/getClient:start`,
                );

                try {
                    const client = await clientService.getByIdToView(clientId);

                    if (!!client.id) client.phone = formatPhoneForUI(client.phone);

                    set({ client: client, isLoading: false, error: '' }, false, `${name}/getClient:success`);

                    return client;
                } catch (error: unknown) {
                    if (error instanceof AppError)
                        set({ error: error.message }, false, `${name}/getClient:errosMessage`);
                    set({ isLoading: false }, false, `${name}/getClient:error`);
                    notify.error(`Клієнта не існує: ${get().error}`);
                }
            },

            setClient: (clientId) => set({ clientId }),

            getClients: async () => {
                set({ isLoading: true, clients: undefined, error: '' }, false, `${name}/getClients:start`);

                try {
                    const clientsDB = await clientService.getAll();

                    const clients: ClientViewDTO[] = clientsDB.map((i) => ({ ...i, phone: formatPhoneForUI(i.phone) }));

                    set({ isLoading: false, clients, error: '' }, false, `${name}/getClients:start`);

                    return clients;
                } catch (error: unknown) {
                    console.log(error);
                    if (error instanceof AppError)
                        set({ error: error.message }, false, `${name}/getClients:errosMessage`);
                    set({ isLoading: false }, false, `${name}/getClients:error`);
                    notify.error(`Помилка отрмання списку клієнтів: ${get().error}`);
                }
            },
            deleteClient: async (clientId) => {
                set({ client: undefined, isLoading: true, error: '' }, false, `${name}/deleteClient:start`);

                try {
                    await clientService.delete(clientId);

                    set({ client: undefined, isLoading: false, error: '' }, false, `${name}/deleteClient:success`);
                    notify.success(`Клієнта видалено`);
                } catch (error: unknown) {
                    if (error instanceof AppError)
                        set({ error: error.message }, false, `${name}/deleteClient:errosMessage`);
                    set({ isLoading: false }, false, `${name}/deleteClient:error`);
                    notify.error(`Помилка видалення клієнта: ${get().error}`);
                }
            },
            saveClient: async (client) => {
                console.log(client);
                set(
                    {
                        isLoading: true,
                        error: '',
                    },
                    false,
                    `${name}/saveClient:start`,
                );

                try {
                    const saveClient = await clientService.save(client);
                    set(
                        { client: saveClient, contacts: [], isLoading: false, error: '' },
                        false,
                        `${name}/saveClient:success`,
                    );
                    notify.success(`Клієнта збережено`);

                    return saveClient;
                } catch (error) {
                    if (error instanceof AppError)
                        set({ error: error.message }, false, `${name}/saveClient:errosMessage`);
                    set({ isLoading: false }, false, `${name}/saveClient:error`);
                    notify.error(`Помилка збереження клієнта: ${get().error}`);
                }
            },
            saveClients: async () => {
                set(
                    {
                        isLoading: true,
                        error: '',
                    },
                    false,
                    `${name}/saveClients:start`,
                );

                try {
                    const savedClients = await clientService.saveBulk(get().contacts);
                    set(
                        { clients: [], contacts: [], isLoading: false, error: '' },
                        false,
                        `${name}/saveClients:success`,
                    );
                    notify.success(`Клієнтів успішно збережено`);

                    return savedClients;
                } catch (error) {
                    console.log(error);
                    if (error instanceof AppError)
                        set({ error: error.message }, false, `${name}/saveClients:errosMessage`);
                    set({ isLoading: false }, false, `${name}/saveClients:error`);
                    notify.error(`Помилка збереження клієнтів: ${get().error}`);
                }
            },
            handlePickContacts: async () => {
                // 1. Check if the API is supporteds
                const supported = 'contacts' in navigator && 'ContactsManager' in window;
                console.log(supported);
                if (supported) {
                    try {
                        // 2. Define which properties you want to retrieve
                        // Options: 'name', 'email', 'tel', 'address', 'icon'
                        const props = ['name', 'tel'];
                        const options = { multiple: true }; // Allow selecting multiple contacts

                        // 3. Open the native contact picker
                        //@ts-ignore
                        const selectedContacts: ContactInfo[] = await navigator.contacts.select(props, options);

                        set({
                            contacts: selectedContacts.map((i) => fromContactToClientMapper(i)),
                        });
                    } catch (error) {
                        console.error('Contact picker failed:', error);

                        if (error instanceof AppError)
                            set({ error: error.message }, false, `${name}/saveClients:errosMessage`);
                        set({ isLoading: false }, false, `${name}/saveClients:error`);
                        notify.error(`Помилка збереження клієнтів: ${get().error}`);
                    }
                } else {
                    console.log('Contact Picker API is not supported on this browser.');

                    notify.error(`Contact Picker API не підтримується в цьому браузері`);
                }
            },
        }),
        { name, enabled: false },
    ),
);

function formatPhoneForUI(phone: string) {
    // 1. Remove all non-numeric characters
    let cleaned = ('' + phone).replace(/\D/g, '');

    // 2. Normalize: Remove leading '38' if it exists to normalize (0xx)xxx-xx-xx
    if (cleaned.startsWith('38')) {
        cleaned = cleaned.substring(2);
    }

    // 3. Ensure it starts with '0' and has 10 digits
    const match = cleaned.match(/^0\d{9}$/);

    if (match) {
        // 4. Apply format: +38 (0xx) xxx-xx-xx
        return `+38 (0${cleaned.substring(1, 3)}) ${cleaned.substring(3, 6)}-${cleaned.substring(6, 8)}-${cleaned.substring(8, 10)}`;
    } else throw new AppError('DOMAIN', 'Помилка формату номера телефону');

    // return phone; // Return original or handle error if invalid
}

function fromContactToClientMapper(client: ContactInfo): ClientViewDTO {
    const name = !!client.name && client.name.length === 1 ? client.name[0] : '';

    const phone = !!client.tel && client.tel.length === 1 ? client.tel[0] : '';

    return {
        id: 0,
        name: name,
        phone: formatPhoneForUI(phone),
        createdAt: 0,
        updatedAt: 0,
    };
}
