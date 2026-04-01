import { Button, DialogActions, DialogContent, DialogTitle, FormControl, TextField } from '@mui/material';
import { Formik, Field, Form } from 'formik';
import * as Yup from 'yup';
import type { ProductCategory } from '../../../../backend/domain/product/ProductCategory';

export function ProductUpdateParam({
    onSubmit,
    handleClose,
    unitOperation,
    categoryName,
    limit,
}: {
    onSubmit: (values: { unitOperation: 'add' | 'subtract'; param: number }) => void;
    unitOperation: 'add' | 'subtract';
    categoryName: ProductCategory;
    handleClose: () => void;
    limit?: number;
}) {
    return (
        <Formik
            initialValues={{
                param: 0,
                unitOperation,
            }}
            onSubmit={(values) => {
                console.log(values);
                onSubmit(values);
            }}
            validationSchema={Yup.object().shape({
                param: Yup.number()
                    .min(0, 'Позитивне значення')
                    .max(limit ?? 9999, 'Завелике значення')
                    .required("Поле обов'язкове"),
            })}
            validateOnChange={true}
            validateOnMount={true}
        >
            {({ errors, setFieldValue }) => (
                <Form id="paramForm">
                    <DialogTitle>
                        {unitOperation === 'add' ? 'Збільшити' : 'Зменшити'}
                        {categoryName === 'bag' ? ' кількість' : ' вагу'}{' '}
                        {!!limit && limit > 0 && ` (Максимум: ${limit})`}
                    </DialogTitle>
                    <DialogContent>
                        <FormControl margin="dense">
                            <Field
                                component={TextField}
                                name="param"
                                type="number"
                                onChange={(e: React.ChangeEvent<any>) => {
                                    setFieldValue('param', e.target.value);
                                }}
                                helperText={errors.param}
                                error={!!errors.param}
                            />
                        </FormControl>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleClose}>Відміна</Button>
                        <Button color={'error'} type="submit" form="paramForm">
                            Підтвердити
                        </Button>
                    </DialogActions>
                </Form>
            )}
        </Formik>
    );
}
