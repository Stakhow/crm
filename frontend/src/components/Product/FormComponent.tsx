import { Box, Button, Backdrop, CircularProgress } from '@mui/material';
import { Formik, Form } from 'formik';
import { useMemo } from 'react';
import { BottomBar } from '../BottomBar';
import { categoryStore } from '../../../store';
import { validationSchema } from './validationSchema';
import type { CreateProductUIDTO } from '../../../store/ProductStore';
import { Fields } from './Fields';

export const FormComponent = ({
    props,
    onSubmit,
}: {
    props: CreateProductUIDTO;
    onSubmit: (values: CreateProductUIDTO) => void;
}) => {
    const schema = useMemo(() => validationSchema(), [props]);
    const { categoryName } = categoryStore((s) => s);

    return (
        <Formik validationSchema={schema} initialValues={props} onSubmit={onSubmit} context={{ categoryName }}>
            {({ isSubmitting, values }) => {
                return (
                    <Form>
                        <Box sx={{ mb: 8 }}>
                            <Fields />
                        </Box>

                        <BottomBar>
                            <Button variant="contained" fullWidth type={'submit'} color="primary" disabled={!values}>
                                Зберегти
                            </Button>
                        </BottomBar>

                        <Backdrop
                            sx={(theme: any) => ({ color: '#fff', zIndex: theme.zIndex.drawer + 1 })}
                            open={isSubmitting}
                        >
                            <CircularProgress color="inherit" />
                        </Backdrop>
                    </Form>
                );
            }}
        </Formik>
    );
};
