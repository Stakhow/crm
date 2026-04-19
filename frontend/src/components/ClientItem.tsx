import { Button, Card, ListItem, ListItemText, type CardProps } from '@mui/material';
import { NavLink } from 'react-router';
import type { ClientViewDTO } from '../../../dto/ClientViewDTO';

interface ClientItemProps extends CardProps {
    client: ClientViewDTO;
}

export const ClientItem: React.FC<ClientItemProps> = ({ client, ...rest }) => (
    <ListItem component={Card} key={client.id} raised {...rest}>
        <Button variant="outlined" fullWidth component={NavLink} to={`/clients/${client.id}`}>
            <ListItemText primary={client.name} secondary={client.phone} />
        </Button>
    </ListItem>
);
