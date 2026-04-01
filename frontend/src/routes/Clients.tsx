import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import { useEffect, useState } from 'react';
import { Button, Fab, Paper, Typography } from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import CallIcon from '@mui/icons-material/Call';
import Link from '@mui/material/Link';
import { useNotification } from '../components/NotificationContext';
import { NavLink } from 'react-router';
import { clientService } from '../../../backend/index';
import type { ClientViewDTO } from '../../../dto/ClientViewDTO';
import { styled } from '@mui/system';

export default function Clients() {
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

    const StyledNavLink = styled(NavLink)({
        width: '100%',
        display: 'block',
    });

    const clientList = list.map((i) => (
        <ListItem
            key={i.id}
            sx={{
                margin: '8px 0',
                boxShadow: 3,
                borderRadius: 1,
                backgroundColor: 'background.paper',
                padding: 3,
            }}
            color={'primary'}
        >
            <ListItemAvatar>
                <AccountCircleIcon fontSize={'large'} />
            </ListItemAvatar>
            <StyledNavLink to={`${i.id}`}>
                <Button variant="outlined" fullWidth>
                    <ListItemText primary={i.name} secondary={i.phone} />
                </Button>
            </StyledNavLink>
        </ListItem>
    ));

    return (
        <Paper sx={{ p: 2 }} elevation={12}>
            {!!list.length ? <List>{clientList}</List> : 'Немає Клієнтів'}
        </Paper>
    );
}
