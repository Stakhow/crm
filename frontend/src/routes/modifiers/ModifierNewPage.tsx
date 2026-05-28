// import { Backdrop, Box, CircularProgress, Typography } from '@mui/material';

// import { modifierStore } from '../../../store';
// import { useNavigate } from 'react-router';
// import { ModifierForm } from '../../components/Modifiers/ModifiersForm';

export default function ModifierNewPage() {
    //     const navigate = useNavigate();
    //     const { isLoading, createModifier } = modifierStore((s) => s);
    //     const modifier = {
    //         id: 0,
    //         name: '',
    //         categories: [],
    //         list: [{ id: 0, name: '', price: 0 }],
    //     };
    //     return (
    //         <Box>
    //             {!isLoading && (
    //                 <>
    //                     <Typography variant="h6" mt={1} textAlign={'center'} gutterBottom>
    //                         Додати новий модифікатор
    //                     </Typography>
    //                     <ModifierForm
    //                         modifier={modifier}
    //                         submitHandler={async (values) => {
    //                             const modifier = await createModifier(values);
    //                             if (modifier) navigate(`/modifiers/${modifier.id}`);
    //                         }}
    //                     />
    //                 </>
    //             )}
    //             <Backdrop sx={(theme: any) => ({ color: '#fff', zIndex: theme.zIndex.drawer + 1 })} open={isLoading}>
    //                 <CircularProgress color="inherit" />
    //             </Backdrop>
    //         </Box>
    //     );
}
