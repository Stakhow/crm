import { useNavigate, useParams } from 'react-router';
import { useEffect, useState } from 'react';
import {
    Backdrop,
    Box,
    Button,
    Card,
    CardActions,
    CircularProgress,
    FormControl,
    FormHelperText,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Stack,
    Typography,
} from '@mui/material';
import { cartService, orderService } from '../../../backend';
import type { OrderViewDTO } from '../../../dto/OrderViewDTO';
import { dateToLocalString, priceFormat } from '../../../utils/utils';
import { ProductCard } from '../components/Product/ProductCard';
import { useNotification } from '../components/NotificationContext';

const SelectComponent = ({
    title,
    options,
    name,
    value,
    onChange,
}: {
    title: string;
    name: string;
    value: string;
    options: { title: string; value: OrderViewDTO['status'] }[];
    onChange: (value: OrderViewDTO['status']) => void;
}) => {
    const [selected, setSelected] = useState<string>(value);

    return (
        <FormControl fullWidth margin="dense">
            <InputLabel id={`modifierSelectLabel_${name}`}>{title}</InputLabel>
            <Select
                aria-labelledby={`modifierSelectLabel_${name}`}
                id={`modifier-select-${name}`}
                label={`modifier-select-${name}`}
                name={name}
                value={selected}
                onChange={(e) => {
                    setSelected(e.target.value);
                    onChange(e.target.value as OrderViewDTO['status']);
                }}
            >
                {options.map((i, itemIdx) => (
                    <MenuItem key={itemIdx} value={i.value} sx={{ textTransform: 'capitalize' }}>
                        {i.title}
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    );
};

export default function Order() {
    let { id } = useParams();

    const [order, setOrder] = useState<OrderViewDTO>();
    const [isLoading, setLoading] = useState<boolean>(false);
    const { notify } = useNotification();
    const navigate = useNavigate();

    useEffect(() => {
        !!id &&
            orderService.getById(Number(id)).then((order) => {
                setOrder(order);
            });
    }, []);

    return (
        <Box>
            {!!order ? (
                <Box>
                    <Card sx={{ p: 2 }} raised>
                        <Stack direction={'column'} spacing={2}>
                            <Typography variant={'h5'} component={'h1'}>
                                Замовлення #: {order.id}
                            </Typography>

                            <Stack spacing={1}>
                                <Button
                                    fullWidth
                                    variant="contained"
                                    onClick={() => {
                                        orderService
                                            .repeatOrder(Number(id))
                                            .then(() => {
                                                notify({
                                                    message: 'Сворено корзину із замовлення',
                                                    severity: 'success',
                                                });
                                                // navigate(`/cart/new/${id}`); // old
                                                navigate(`/cart/`);
                                            })
                                            .catch((error) => {
                                                notify({
                                                    message: `Помилка дублювання замовлення: ${error.message ?? error.message}`,
                                                    severity: 'error',
                                                });
                                            });
                                    }}
                                >
                                    Повторити замовлення
                                </Button>
                            </Stack>

                            <Typography>
                                Від: <b> {dateToLocalString(order.createdAt)}</b>
                            </Typography>
                            <Typography>
                                Клієнт: <b> {order.client.name}</b>
                            </Typography>
                            <SelectComponent
                                title={'Статус'}
                                name={'status'}
                                value={order.status}
                                options={order.statuses}
                                onChange={(value) => {
                                    setLoading(true);
                                    orderService
                                        .updateStatus(Number(id), value)
                                        .then(() => {
                                            notify({ message: 'Статус оновлено', severity: 'success' });
                                        })
                                        .catch((error) => {
                                            notify({
                                                message: `Помилка оновлення статусу: ${error.message ?? error.message}`,
                                                severity: 'error',
                                            });
                                        })
                                        .finally(() => {
                                            setLoading(false);
                                        });
                                }}
                            />
                            <Typography>
                                Загальна вартість: <b> {priceFormat(order.totalAmount)}</b>
                            </Typography>
                        </Stack>
                    </Card>

                    {order.items.map((product, idx) => (
                        <ProductCard key={idx} product={product} />
                    ))}
                </Box>
            ) : (
                `Такого замовлення не існує #:${id}`
            )}

            <Backdrop sx={(theme: any) => ({ color: '#fff', zIndex: theme.zIndex.drawer + 1 })} open={isLoading}>
                <CircularProgress color="inherit" />
            </Backdrop>
        </Box>
    );
}
