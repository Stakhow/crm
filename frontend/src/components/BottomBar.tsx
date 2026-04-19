import { AppBar, Toolbar, Stack } from '@mui/material';
import type { ReactNode } from 'react';

export const BottomBar = ({ children }: { children: ReactNode }) => {
    return (
        <AppBar position="fixed" color="default" sx={{ top: 'auto', bottom: 0, py: 1 }}>
            <Toolbar>
                <Stack spacing={1} direction={'column'} sx={{ width: '100%' }}>
                    {children}
                </Stack>
            </Toolbar>
        </AppBar>
    );
};
