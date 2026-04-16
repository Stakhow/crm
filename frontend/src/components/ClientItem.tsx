import { Button, ListItem, ListItemText } from '@mui/material';
import { NavLink } from 'react-router';
import type { ClientDTO } from '../../../dto/ClientDTO';

export const ClientItem = ({ client }: { client: ClientDTO }) => (
    <ListItem
        key={client.id}
        sx={{
            margin: '8px 0',
            boxShadow: 3,
            borderRadius: 1,
            backgroundColor: 'background.paper',
            padding: 3,
        }}
        color={'primary'}
    >
        <Button variant="outlined" fullWidth component={NavLink} to={`${client.id}`}>
            <ListItemText primary={client.name} secondary={client.phone} />
        </Button>
    </ListItem>
);
