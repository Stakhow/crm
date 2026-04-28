import { Backdrop, Box, Button, Card, Chip, CircularProgress, Stack, Typography } from '@mui/material';

import { modifierStore, productStore } from '../../../store';
import { useEffect, useState } from 'react';
import { NavLink, useNavigate, useParams } from 'react-router';
import { ComponentNotFound } from '../../components/ComponentNotFound';
import { ModifierForm } from '../../components/Modifiers/ModifiersForm';
import { ConfirmationDialog } from '../../components/ConfirmationDialog';

export default function ModifierPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [openDialog, setOpenDialog] = useState(false);

    const { isLoading, modifier, updateModifier, getModifier, deleteModifier, usedInProducts } = modifierStore(
        (s) => s,
    );

    const { getProductsByIds, products } = productStore((s) => s);

    useEffect(() => {
        getModifier(Number(id));
    }, []);
    useEffect(() => {
        if (!!usedInProducts && !!usedInProducts.length) getProductsByIds(usedInProducts);
    }, [usedInProducts]);

    const UsedInProducts = () => {
        const productsList = products.map((i) => (
            <Chip key={i.id} label={i.name} component={NavLink} to={`/products/${i.id}`} />
        ));

        return !!products && !!products.length ? (
            <Card sx={{ p: 2, mb: 2 }} raised>
                <Typography variant="body2" textAlign={'center'} gutterBottom color="warning">
                    Щоб видалити модифікатор, потрібно прибрати його використання в продуктах:
                </Typography>
                <Stack direction={'row'} flexWrap={'wrap'} justifyContent={'center'} spacing={1} mt={2}>
                    {productsList}
                </Stack>
            </Card>
        ) : null;
    };

    return (
        <Box>
            {!isLoading && (
                <>
                    {!!modifier ? (
                        <Box sx={{ mb: 10 }}>
                            <Typography variant="h6" mt={1} textAlign={'center'} gutterBottom>
                                Редагування модифікатора:
                            </Typography>

                            <UsedInProducts />

                            <ModifierForm modifier={modifier} submitHandler={updateModifier} />
                            <Button
                                variant="outlined"
                                fullWidth
                                color={'error'}
                                onClick={() => {
                                    setOpenDialog(true);
                                }}
                            >
                                Видалити
                            </Button>
                        </Box>
                    ) : (
                        <ComponentNotFound
                            title={'Модифікатор не знайдено'}
                            buttonText={'Додати модифікатор'}
                            link={'/modifiers/new'}
                        />
                    )}

                    <ConfirmationDialog
                        isOpen={openDialog}
                        title={'Видалити модифікатор?'}
                        handleClose={() => setOpenDialog(false)}
                        handleConfirmClick={async () => {
                            const deletedId = await deleteModifier(Number(id));
                            setOpenDialog(false);
                            if (deletedId) navigate('/modifiers');
                        }}
                    />
                </>
            )}

            <Backdrop sx={(theme: any) => ({ color: '#fff', zIndex: theme.zIndex.drawer + 1 })} open={isLoading}>
                <CircularProgress color="inherit" />
            </Backdrop>
        </Box>
    );
}
