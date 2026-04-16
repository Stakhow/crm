import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

type Notification = {
    id: string;
    type: 'success' | 'error' | 'info';
    message: string;
};

type Store = {
    notifications: Notification[];
    push: (n: Omit<Notification, 'id'>) => void;
    remove: (id: string) => void;
};

const name = 'useNotificationStore';
export const useNotificationStore = create<Store>()(
    devtools(
        (set) => ({
            notifications: [],

            push: (n) =>
                set(
                    (state) => ({
                        notifications: [...state.notifications, { ...n, id: crypto.randomUUID() }],
                    }),
                    false,
                    `${name}/push`,
                ),

            remove: (id) =>
                set(
                    (state) => ({
                        notifications: state.notifications.filter((n) => n.id !== id),
                    }),
                    false,
                    `${name}/remove`,
                ),
        }),
        { name, enabled: false },
    ),
);

export const notify = {
    success: (msg: string) =>
        useNotificationStore.getState().push({
            type: 'success',
            message: msg,
        }),

    error: (msg: string) =>
        useNotificationStore.getState().push({
            type: 'error',
            message: msg,
        }),
};
