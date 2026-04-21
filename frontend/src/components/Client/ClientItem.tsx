import { Button, Card, ListItem, ListItemText, type CardProps } from '@mui/material';
import { NavLink } from 'react-router';

interface ClientItemProps extends CardProps {
    client: {
        id?: number;
        name: string;
        phone: string;
    };
}

export const ClientItem: React.FC<ClientItemProps> = ({ client, ...rest }) => (
    <ListItem component={Card} key={client.id} raised {...rest}>
        <Button variant="outlined" fullWidth component={NavLink} to={!!client.id ? `/clients/${client.id}` : ''}>
            <ListItemText primary={client.name} secondary={client.phone} />
        </Button>
    </ListItem>
);
