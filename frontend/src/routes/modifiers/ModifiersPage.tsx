import {
    Button,
    Paper,
    Typography,
    Stack,
    List,
    ListItem,
    ListItemText,
    Card,
    Backdrop,
    CircularProgress,
    Box,
} from '@mui/material';
import { useEffect, type ReactNode } from 'react';
import type { ProductModifierDTO } from '../../../../dto/ProductModifierDTO';
import { priceFormat } from '../../../../utils/utils';
import { NavLink } from 'react-router';
import { modifierStore } from '../../../store';
import { BottomBar } from '../../components/BottomBar';

export interface DialogProps {
    open: boolean;
    modifier?: ProductModifierDTO;
    onClose: () => void;
    children?: ReactNode;
}

export default function ModifiersPage() {
    const { getAll, isLoading, modifiers } = modifierStore((s) => s);

    useEffect(() => {
        getAll();
    }, []);

    const Modifier = ({ data }: { data: ProductModifierDTO }) => {
        return (
            <Card sx={{ p: 2, mb: 2 }} raised>
                <Typography>
                    <b>ID:</b> {data.id}
                </Typography>
                <Typography>
                    <b>Назва:</b> {data.name}
                </Typography>

                <Typography>
                    <b>Варіанти:</b>
                </Typography>
                <Paper variant="outlined">
                    <List dense={false} sx={{ listStyle: 'decimal', pl: 4 }}>
                        {data.list.map((i) => (
                            <ListItem key={i.id} sx={{ display: 'list-item' }} divider>
                                <ListItemText primary={`${i.name} - ${priceFormat(i.price)}/кг`} />
                            </ListItem>
                        ))}
                    </List>
                </Paper>

                <Stack direction={'row'} mt={2} spacing={1}>
                    <Button
                        variant="outlined"
                        fullWidth
                        color={'info'}
                        component={NavLink}
                        to={`/modifiers/${data.id}`}
                    >
                        Редагувати
                    </Button>
                </Stack>
            </Card>
        );
    };

    return (
        <Box sx={{ mb: 10 }}>
            <Typography component={'h1'} variant="h5" textAlign={'center'}>
                Модифікатори ціни:
            </Typography>

            {!!modifiers && !!modifiers.length && modifiers.map((i) => <Modifier key={i.id} data={i} />)}

            <BottomBar>
                <Button variant="contained" component={NavLink} to={'/modifiers/new'} fullWidth>
                    Додати Модифікатор
                </Button>
            </BottomBar>

            <Backdrop sx={(theme: any) => ({ color: '#fff', zIndex: theme.zIndex.drawer + 1 })} open={isLoading}>
                <CircularProgress color="inherit" />
            </Backdrop>
        </Box>
    );
}
