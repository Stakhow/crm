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
} from '@mui/material';
import { useFormikContext, Formik, Form, type FormikHelpers, FieldArray, getIn, Field } from 'formik';
import { useMemo, useEffect, useState, useRef } from 'react';
import type { ProductToCreateDTO } from '../../../../dto/ProductToCreateDTO';
import { priceFormat } from '../../../../utils/utils';
import * as Yup from 'yup';
import { productService } from '../../../../backend';
import { useParams } from 'react-router';
import { useNotification } from '../NotificationContext';

let counter = 0;

export const FormComponent = ({ id, values }: { id: number; values: ProductToCreateDTO }) => {
    const [weight, setWeight] = useState(values.weight);
    const [price, setPrice] = useState(values.price);
    const [totalAmount, setTotalAmount] = useState(values.totalAmount);

    const isFirstRender = useRef(true);

    const { notify } = useNotification();
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

                    value: Yup.lazy((value, { parent, options }) => {
                        const name = parent.name;
                        const categoryName = options?.context?.categoryName;

                        let schema = allFields[name];

                        if (!schema) {
                            return Yup.mixed();
                        }

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

    const AutoCalc = () => {
        const { values, isValid, setSubmitting } = useFormikContext<ProductToCreateDTO>();

        useEffect(() => {
            if (isFirstRender.current) {
                isFirstRender.current = false;
                return;
            }
            if (!isValid) return;

            console.log('COMPONENT times', ++counter);
            setSubmitting(true);
            productService.calculateDraft(id, values).then((updatedValues) => {
                const { price, totalAmount, weight } = updatedValues;

                setTotalAmount(totalAmount);
                setWeight(weight);
                setPrice(price);

                setSubmitting(false);
            });
        }, [values.fields, values.modifiers]);

        return null;
    };
    return (
        <Formik
            validationSchema={schema}
            initialValues={values}
            // validateOnMount={true}
            // validateOnChange={true}
            enableReinitialize={true}
            onSubmit={(values: ProductToCreateDTO, FormikHelpers: FormikHelpers<ProductToCreateDTO>) => {
                const action = () => {
                    return !!id
                        ? productService.updateProduct(id, values)
                        : productService.createProduct(values.categoryName, values);
                };

                action()
                    .then((product) => {
                        notify({ message: `Продукт успішно ${!!id ? 'оновлено' : 'створено'} `, severity: 'success' });
                    })
                    .catch((error) => {
                        notify({
                            message: `Помилка при ${!!id ? 'оновленні' : 'створенні'} продукту`,
                            severity: 'error',
                        });
                        console.error('Error editing product:', error);
                    })
                    .finally(() => {
                        FormikHelpers.setSubmitting(false);
                    });
            }}
            context={{ categoryName: values.categoryName }}
        >
            {({ isSubmitting, setFieldValue, values, errors, touched, handleBlur, handleChange }) => {
                const { modifiers, fields } = values;

                return (
                    <Form>
                        <AutoCalc />
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

                                            const isWeightField = field.name === 'weight';
                                            field.value = isWeightField ? weight : field.value;

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
                                                        // onFocus={(e) => {
                                                        //     if (e.target.value == '0')
                                                        //         setFieldValue(fieldName, '', false);
                                                        // }}
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
                                Ціна: <b>{priceFormat(price)}/кг</b>
                            </Typography>
                        )}
                        <AppBar position="fixed" color="primary" sx={{ top: 'auto', bottom: 0 }}>
                            <Toolbar>
                                <Button
                                    variant="outlined"
                                    sx={{ color: 'white', borderColor: 'white' }}
                                    fullWidth
                                    type={'submit'}
                                    disabled={!values}
                                >
                                    Підтвердити | Сума:&nbsp;
                                    <b>{priceFormat(totalAmount)}</b>
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
