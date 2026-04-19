import { create } from 'zustand';
import { AppError } from '../../utils/error';
import { notify } from './NotificationStore';
import { devtools } from 'zustand/middleware';
import type { ClientViewDTO } from '../../dto/ClientViewDTO';
import { clientService } from '../../backend';

interface ClientState {
    isLoading: boolean;
    error: string;
    client: ClientViewDTO;
    clientId: number;
    clients: ClientViewDTO[];
    getClient: (clientId: number) => ClientViewDTO;
    setClient: (clientId: number) => void;
    getClients: () => ClientViewDTO[];
    deleteClient: (clientId: number) => void;
    saveClient: (client: ClientViewDTO) => ClientViewDTO;
}

const name = 'clientStore';
export const clientStore = create<ClientState>()(
    devtools(
        (set, get) => ({
            isLoading: false,
            error: '',
            client: undefined,
            clients: undefined,

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
                    const _client = await clientService.getByIdToView(clientId);

                    set({ client: _client, isLoading: false, error: '' }, false, `${name}/getClient:success`);

                    return _client;
                } catch (error: unknown) {
                    if (error instanceof AppError)
                        set({ error: error.message }, false, `${name}/getClient:errosMessage`);
                    set({ isLoading: false }, false, `${name}/getClient:error`);
                    notify.error(`Клієнта не існує: ${get().error}`);
                }
            },

            setClient: (clientId) => set({ clientId: clientId }),

            getClients: async () => {
                set({ isLoading: true, clients: undefined, error: '' }, false, `${name}/getClients:start`);

                try {
                    const clients = await clientService.getAll();

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
                    // notify.success(`Корзину видалено`);
                } catch (error: unknown) {
                    if (error instanceof AppError)
                        set({ error: error.message }, false, `${name}/deleteClient:errosMessage`);
                    set({ isLoading: false }, false, `${name}/deleteClient:error`);
                    notify.error(`Помилка видалення клієнта: ${get().error}`);
                }
            },
            saveClient: async (client) => {
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
                    set({ client: saveClient, isLoading: false, error: '' }, false, `${name}/saveClient:success`);
                    notify.success(`Клієнта успішно збережено`);

                    return saveClient;
                } catch (error) {
                    if (error instanceof AppError)
                        set({ error: error.message }, false, `${name}/saveClient:errosMessage`);
                    set({ isLoading: false }, false, `${name}/saveClient:error`);
                    notify.error(`Помилка збереження клієнта: ${get().error}`);
                }
            },
        }),
        { name, enabled: false },
    ),
);
