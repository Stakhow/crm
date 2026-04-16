import {
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    FormHelperText,
    Box,
    TextField,
    Typography,
    AppBar,
    Toolbar,
    Button,
    Backdrop,
    CircularProgress,
    Stack,
    Card,
} from '@mui/material';
import { Formik, Form, type FormikHelpers, FieldArray, getIn } from 'formik';
import { useMemo, useRef } from 'react';
import type { ProductToCreateDTO } from '../../../../dto/ProductToCreateDTO';
import { priceFormat } from '../../../../utils/utils';
import * as Yup from 'yup';

export const FormComponent = ({
    values,
    onSubmit,
}: {
    id: number;
    values: ProductToCreateDTO;
    onSubmit: (values: ProductToCreateDTO) => void;
}) => {
    const calculatedData = useRef<{
        price: number;
        weight: number;
        totalAmount: number;
        pricePerItem: number;
    }>({
        price: values.price,
        weight: values.weight,
        totalAmount: values.totalAmount,
        pricePerItem: values.pricePerItem,
    });

    calculatedData.current = values;

    const validationSchema = () => {
        const allFields = {
            width: Yup.number().min(30, 'Замалий розмір').max(100, 'Завеликий розмір').required("Поле обов'язкове"),
            length: Yup.number().min(25, 'Замалий розмір').max(200, 'Завеликий розмір').required("Поле обов'язкове"),
            thickness: Yup.number().min(25, 'Замалий розмір').max(100, 'Завеликий розмір').required("Поле обов'язкове"),
            quantity: Yup.number().positive('Тільки позитивне число').required("Поле обов'язкове"),
        };

        return Yup.object({
            categoryName: Yup.string().required(),
            // totalAmount: Yup.number().moreThan(0, 'Позитивне значення').required("Поле обов'язкове"),
            // price: Yup.number().moreThan(0, 'Позитивне значення').required("Поле обов'язкове"),

            fields: Yup.array().of(
                Yup.object({
                    name: Yup.string().required(),

                    // @ts-ignore
                    value: Yup.lazy((value, { parent, options }) => {
                        const name = parent.name;
                        const categoryName = options?.context?.categoryName;

                        // @ts-ignore
                        let schema = allFields[name];

                        if (!schema) {
                            return Yup.mixed();
                        }
                        // @ts-ignore
                        schema = schema.transform((val, originalVal) =>
                            originalVal === '' ? undefined : Number(originalVal),
                        );

                        if (name === 'quantity' && categoryName === 'bag') {
                            schema = schema.integer('Тільки ціле число');
                        }

                        return schema;
                    }),
                }),
            ),
        });
    };

    const schema = useMemo(() => validationSchema(), [values]);

    return (
        <Formik
            validationSchema={schema}
            initialValues={values}
            // validateOnMount={true}
            // validateOnChange={true}
            enableReinitialize={true}
            onSubmit={(values: ProductToCreateDTO, { setSubmitting }: FormikHelpers<ProductToCreateDTO>) => {
                onSubmit(values);
                setSubmitting(false);
            }}
            context={{ categoryName: values.categoryName }}
        >
            {({ isSubmitting, values, errors, handleBlur, handleChange }) => {
                const { modifiers, fields } = values;

                return (
                    <Form>
                        <Card sx={{ mb: 8, p: 2 }} raised>
                            <FieldArray
                                name="modifiers"
                                render={() => (
                                    <Box>
                                        {modifiers.length > 0 &&
                                            modifiers.map((modifier, index) => {
                                                const fieldName = `modifiers.${index}.value`;
                                                const error = getIn(errors, fieldName);

                                                return (
                                                    <FormControl fullWidth margin="dense" key={index}>
                                                        <InputLabel id={fieldName}>{modifier.name}</InputLabel>
                                                        <Select
                                                            aria-labelledby={fieldName}
                                                            id={`modifier-select-${modifier.id}`}
                                                            name={fieldName}
                                                            value={modifier.value}
                                                            onChange={handleChange}
                                                            error={!!error}
                                                        >
                                                            {modifier.list.map((i, itemIdx) => (
                                                                <MenuItem
                                                                    key={itemIdx}
                                                                    value={i.id}
                                                                    sx={{ textTransform: 'capitalize' }}
                                                                >
                                                                    {i.name} {i.price}грн.
                                                                </MenuItem>
                                                            ))}
                                                        </Select>

                                                        <FormHelperText error={!!error}>{error}</FormHelperText>
                                                    </FormControl>
                                                );
                                            })}
                                    </Box>
                                )}
                            />

                            <FieldArray
                                name="fields"
                                render={() => (
                                    <Stack direction={'row'} flexWrap={'wrap'} spacing={1} useFlexGap>
                                        {fields.length > 0 &&
                                            fields.map((field, index) => {
                                                const fieldName = `fields.${index}.value`;
                                                const error = getIn(errors, fieldName);

                                                const name = field.name as keyof typeof calculatedData.current;
                                                field.value =
                                                    name in calculatedData.current
                                                        ? calculatedData.current[name]
                                                        : field.value;

                                                return (
                                                    <FormControl
                                                        sx={{
                                                            flex: field.name === 'name' ? '2 1 100%' : '1 1 40%',
                                                        }}
                                                        margin="dense"
                                                        key={index}
                                                    >
                                                        <TextField
                                                            placeholder={field.placeholder ?? ''}
                                                            disabled={field.disabled}
                                                            hiddenLabel={field.fieldType === 'hidden'}
                                                            name={fieldName}
                                                            type={field.fieldType}
                                                            label={field.title}
                                                            value={field.value !== 0 ? field.value : ''}
                                                            onChange={handleChange}
                                                            onBlur={handleBlur}
                                                            helperText={error}
                                                            error={!!error}
                                                        />
                                                    </FormControl>
                                                );
                                            })}
                                    </Stack>
                                )}
                            />

                            {!!values.price && (
                                <Typography variant="h6" sx={{ my: 2 }} textAlign={'center'}>
                                    Ціна: <b>{priceFormat(calculatedData.current.price)}/кг</b>
                                </Typography>
                            )}
                        </Card>

                        <AppBar position="fixed" color="primary" sx={{ top: 'auto', bottom: 0, pb: 1 }}>
                            <Toolbar>
                                <Button variant="outlined" fullWidth type={'submit'} color="inherit" disabled={!values}>
                                    Підтвердити
                                </Button>
                            </Toolbar>
                        </AppBar>
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
