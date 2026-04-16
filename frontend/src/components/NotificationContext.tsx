import React, { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { Snackbar, Alert } from '@mui/material';

import { useEffect } from 'react';
import { useNotificationStore } from '../../store';

export type NotifyFunction = (args: NotifyArgs) => void;

type NotificationContextType = {
    notify: NotifyFunction;
};

const NotificationContext = createContext<NotificationContextType | null>(null);

export const useNotification = (): NotificationContextType => {
    const context = useContext(NotificationContext);

    if (!context) {
        throw new Error('useNotification must be used within NotificationProvider');
    }

    return context;
};

type NotificationState = {
    open: boolean;
    message: ReactNode;
    severity: 'success' | 'error' | 'warning' | 'info';
    duration: number;
};

type NotifyArgs = {
    message: ReactNode;
    severity?: 'success' | 'error' | 'warning' | 'info';
    duration?: number;
};

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
    const { notifications, remove } = useNotificationStore();

    const [notification, setNotification] = useState<NotificationState>({
        open: false,
        message: '',
        severity: 'info',
        duration: 3000,
    });

    const notify: NotifyFunction = useCallback(({ message, severity = 'info', duration = 3000 }: NotifyArgs) => {
        setNotification({
            open: true,
            message,
            severity,
            duration,
        });
    }, []);

    const handleClose = (_: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === 'clickaway') return;

        setNotification((prev) => ({ ...prev, open: false }));
    };

    useEffect(() => {
        notifications.forEach((n) => {
            notify({ message: n.message, severity: n.type });

            remove(n.id);
        });
    }, [notifications]);

    return (
        <NotificationContext.Provider value={{ notify }}>
            {children}

            <Snackbar
                open={notification.open}
                autoHideDuration={notification.duration}
                onClose={handleClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={handleClose} severity={notification.severity} variant="filled" sx={{ width: '100%' }}>
                    {notification.message}
                </Alert>
            </Snackbar>
        </NotificationContext.Provider>
    );
};
