import { Link, useParams, useNavigate } from 'react-router';
import { useNotification } from '../components/NotificationContext';
import { useEffect, useState } from 'react';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CallIcon from '@mui/icons-material/Call';
import {
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    List,
    DialogTitle,
    Divider,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    ListSubheader,
    Collapse,
    ListItem,
    IconButton,
    Fab,
} from '@mui/material';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import { styled } from '@mui/material/styles';
import PhoneIcon from '@mui/icons-material/Phone';
import { ExpandLess, ExpandMore, StarBorder } from '@mui/icons-material';
import { clientService, orderService } from '../../../backend/index';
import type { ClientViewDTO } from '../../../dto/ClientViewDTO';
import { dateToLocalString, priceFormat } from '../../../utils/utils';
import type { OrderViewDTO } from '../../../dto/OrderViewDTO';
import { OrderItem } from '../components/OrderItem';

export default function ClientPage() {
    const [client, setClient] = useState<ClientViewDTO>();
    const [orders, setOrders] = useState<OrderViewDTO[]>();
    const [open, setOpen] = useState(false);

    const { notify } = useNotification();
    const { id } = useParams();
    const navigate = useNavigate();

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const err404 = () =>
        navigate('/404', {
            state: {
                message: 'Такого клієнта не існує',
                linkTo: '/clients',
                linkText: 'До списку клієнтів',
            },
        });

    if (!id) {
        err404();

        return <></>;
    }

    useEffect(() => {
        clientService
            .getById(+id)
            .then((data) => {
                console.log(data);
                if (!data) err404();
                else setClient(data);
            })
            .catch(() => err404());
    }, []);

    useEffect(() => {
        orderService.getByClient(+id).then((orders) => setOrders(orders));
    }, []);

    const deleteClient = () => {
        clientService
            .delete(+id)
            .then(() => {
                handleClose();
                notify({ message: 'Клієнта успішно видалено', severity: 'success' });
                navigate('/clients');
            })
            .catch(() => notify({ message: 'Помилка при видаленні', severity: 'error' }));
    };

    if (!client) return <div>Завантаження...</div>;

    return (
        <>
            <Card elevation={4}>
                <CardContent>
                    <Typography gutterBottom variant="h5" component="div" align={'center'}>
                        {client.name}
                    </Typography>

                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                        {/*<Fab href={`tel:${client.phone}`} size={"small"} color={'primary'}><PhoneIcon/></Fab>*/}
                        <Button href={`/orders/new?clientId=${id}`} size={'large'} variant="outlined" color="success">
                            Нове замовлення
                        </Button>
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    <List
                        sx={{ width: '100%', maxWidth: 480, bgcolor: 'background.paper' }}
                        aria-labelledby="nested-list-subheader"
                    >
                        <List component="div" disablePadding>
                            <ListItem>
                                <Stack spacing={1} justifyContent={'center'} width={'100%'}>
                                    <Button
                                        size="large"
                                        variant="contained"
                                        href={`tel:${client.phone}`}
                                        aria-label="call"
                                    >
                                        <CallIcon sx={{ mr: 2 }} /> {client.phone}
                                    </Button>
                                </Stack>
                            </ListItem>
                            <ListItem>
                                <Typography textAlign={'center'} width={'100%'}>
                                    Доданий: {!!client.createdAt ? dateToLocalString(client.createdAt) : '-------'}
                                </Typography>
                            </ListItem>
                            {client.updatedAt && (
                                <ListItem>
                                    <Typography textAlign={'center'} width={'100%'}>
                                        Дані оновлено: {dateToLocalString(client.updatedAt)}
                                    </Typography>
                                </ListItem>
                            )}
                            <ListItem sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Stack direction={'row'} mt={2} spacing={1} width={'100%'}>
                                    <Button fullWidth variant="outlined" href={`/clients/edit/${id}`}>
                                        Редагувати
                                    </Button>
                                    <Button fullWidth variant="outlined" color="error" onClick={handleClickOpen}>
                                        Видалити
                                    </Button>
                                </Stack>
                            </ListItem>
                        </List>
                    </List>
                </CardContent>
            </Card>

            <Paper sx={{ width: '100%', my: 3, p: 2 }}>
                {!!orders && !!orders.length ? (
                    <>
                        <Typography variant="h6" textAlign={'center'}>
                            Список замовлень:
                        </Typography>
                        <Stack spacing={1}>
                            {orders.map((i) => (
                                <OrderItem key={i.id} order={i} />
                            ))}
                        </Stack>
                    </>
                ) : (
                    <Typography variant="h6" textAlign={'center'}>
                        Замовлення відсутні
                    </Typography>
                )}
            </Paper>

            <Dialog
                open={open}
                onClose={handleClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">Видалити клієнта?</DialogTitle>
                <DialogActions>
                    <Button onClick={handleClose}>Відміна</Button>
                    <Button color={'error'} onClick={deleteClient}>
                        Підтвердити
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
