import { useParams, NavLink, useNavigate } from 'react-router';
import { useEffect, useState } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CallIcon from '@mui/icons-material/Call';
import {
    Dialog,
    DialogActions,
    List,
    DialogTitle,
    Divider,
    ListItem,
    Box,
    Backdrop,
    CircularProgress,
} from '@mui/material';
import Stack from '@mui/material/Stack';
import { dateToLocalString } from '../../../utils/utils';
import { OrderItem } from '../components/Order/OrderItem';
import { ComponentNotFound } from '../components/ComponentNotFound';
import { clientStore, orderStore } from '../../store';
import { BottomBar } from '../components/BottomBar';
import { InitOrderButton } from '../components/Order/OrderButtons';

export default function ClientPage() {
    const [open, setOpen] = useState(false);
    const { isLoading, client, getClient, deleteClient, setClient } = clientStore((state) => state);
    const { orders, getOrdersByClient } = orderStore((state) => state);

    const { id } = useParams();

    const navigate = useNavigate();

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };
    const handleDelete = () => {
        handleClose();
        deleteClient(client.id);
    };

    useEffect(() => {
        getClient(Number(id));
    }, []);

    useEffect(() => {
        if (!!client) getOrdersByClient(client.id);
    }, [client]);

    if (isLoading) return <div></div>;

    return (
        <Box>
            {!!client && !!client.id ? (
                <Box>
                    <Card raised>
                        <CardContent>
                            <Typography gutterBottom variant="h5" component="div" align={'center'}>
                                {client.name} #:{client.id}
                            </Typography>

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
                                        <Box>
                                            <Typography
                                                width={'100%'}
                                                component={'p'}
                                                variant={'overline'}
                                                lineHeight={1.2}
                                            >
                                                Доданий: <b>{dateToLocalString(client.createdAt)}</b>
                                            </Typography>
                                            <Typography
                                                width={'100%'}
                                                component={'p'}
                                                variant={'overline'}
                                                lineHeight={1.2}
                                            >
                                                Дані оновлено: <b>{dateToLocalString(client.updatedAt)}</b>
                                            </Typography>
                                        </Box>
                                    </ListItem>

                                    <ListItem sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Stack direction={'row'} mt={2} spacing={1} width={'100%'}>
                                            <Button
                                                fullWidth
                                                variant="outlined"
                                                component={NavLink}
                                                to={`/clients/edit/${id}`}
                                            >
                                                Редагувати
                                            </Button>
                                            <Button
                                                fullWidth
                                                variant="outlined"
                                                color="error"
                                                onClick={handleClickOpen}
                                            >
                                                Видалити
                                            </Button>
                                        </Stack>
                                    </ListItem>
                                </List>
                            </List>
                        </CardContent>
                    </Card>

                    {!!orders && (
                        <Box my={3}>
                            {!!orders.length ? (
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
                                <ComponentNotFound title={'Замовлення відсутні'} buttonText={''} />
                            )}
                        </Box>
                    )}

                    <BottomBar>
                        <InitOrderButton
                            onClick={() => {
                                if (client.id) setClient(client.id);
                                navigate('/orders/new');
                            }}
                        />
                    </BottomBar>
                </Box>
            ) : (
                <ComponentNotFound title={'Клієнта не знайдено'} buttonText={'Додати клієнта'} link={'/clients/new'} />
            )}

            <Dialog
                open={open}
                onClose={handleClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">Видалити клієнта?</DialogTitle>
                <DialogActions>
                    <Button onClick={handleClose}>Відміна</Button>
                    <Button color={'error'} onClick={handleDelete}>
                        Підтвердити
                    </Button>
                </DialogActions>
            </Dialog>

            <Backdrop sx={(theme: any) => ({ color: '#fff', zIndex: theme.zIndex.drawer + 1 })} open={isLoading}>
                <CircularProgress color="inherit" />
            </Backdrop>
        </Box>
    );
}
