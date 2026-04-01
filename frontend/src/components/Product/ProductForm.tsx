import {
    AppBar,
    Backdrop,
    Box,
    Button,
    CircularProgress,
    FormHelperText,
    Paper,
    Stack,
    TextField,
    Toolbar,
    Typography,
} from '@mui/material';
import { Formik, Form, Field, useFormikContext, type FormikHelpers, FieldArray } from 'formik';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import { FormControl } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import * as Yup from 'yup';
import { Categories } from '../Categories';
import { getWeightOfBag, priceFormat } from '../../../../utils/utils';
import type { ProductToCreateDTO } from '../../../../dto/ProductToCreateDTO';
import type { ProductCategory } from '../../../../backend/domain/product/ProductCategory';
import type { ProductFormValuesDTO } from '../../../../dto/ProductFormValuesDTO';
import { productService } from '../../../../backend';
import { useNotification } from '../NotificationContext';

export function ProductForm({
    onFormSubmit,
}: {
    onFormSubmit: (values: ProductFormValuesDTO, FormikHelpers: FormikHelpers<ProductFormValuesDTO>) => void;
}) {
    const [price, setPrice] = useState<number>(0);
    const [categoryName, setCategoryName] = useState<ProductCategory>();
    const [categories, setCategories] = useState<{ name: ProductCategory; title: string }[]>();
    const [product, setProduct] = useState<ProductToCreateDTO>();
    const [isLoading, setLoading] = useState<boolean>(false);

    const { notify } = useNotification();

    useEffect(() => {
        setLoading(true);
        productService
            .getCategories()
            .then((categories) => {
                setCategories(categories);
                setLoading(false);
            })
            .catch(() => {
                notify({ message: 'Помилка отримання категорій', severity: 'error' });
                setLoading(false);
            });
    }, []);

    useEffect(() => {
        if (!!categoryName) {
            setLoading(true);

            productService
                .init(categoryName)
                .then((product) => {
                    setProduct(product);
                })
                .catch((error) => {
                    notify({ message: 'Помилка при отриманні продукту init', severity: 'error' });
                })
                .finally(() => {
                    setLoading(false);
                });
        }
    }, [categoryName]);

    const FormComponent = ({ product }: { product: ProductToCreateDTO }) => {
        const categoryName = product.category.name;

        const initialValues: ProductFormValuesDTO = {
            price: 0,
            totalAmount: 0,
            categoryName: categoryName,
            fields: {},
            modifiers: {},
        };

        product.initialValues.modifiers.map((i) => {
            initialValues.modifiers[i.id] = i.itemId;
        });

        product.initialValues.fields.map((i) => {
            initialValues.fields[i.name] = i.value;
        });

        const validationSchema = () => {
            const fields = {};

            const allFields = {
                name: Yup.string(),
                weight: Yup.number().when('categoryName', {
                    is: 'bag',
                    then: (schema) => schema.notRequired(),
                    otherwise: (schema) => schema.min(0, 'Не менше ніж нуль').required("Поле обов'язкове"),
                }),
                width: Yup.number().min(30, 'Замалий розмір').max(100, 'Завеликий розмір').required("Поле обов'язкове"),
                length: Yup.number()
                    .min(25, 'Замалий розмір')
                    .max(200, 'Завеликий розмір')
                    .required("Поле обов'язкове"),
                thickness: Yup.number()
                    .min(25, 'Замалий розмір')
                    .max(100, 'Завеликий розмір')
                    .required("Поле обов'язкове"),
                quantity: Yup.number()
                    .positive('Тільки позитивне число')
                    .integer('Тільки ціле число')
                    .required("Поле обов'язкове"),
            };

            if (!!product) {
                product.initialValues.fields.forEach((i) => {
                    const key = i.name as keyof typeof allFields;

                    Object.assign(fields, { [key]: allFields[key] });
                });
            }

            return Yup.object().shape({
                categoryName: Yup.string().required("Поле обов'язкове"),
                fields: Yup.object().shape(fields),
            });
        };

        const schema = useMemo(() => validationSchema(), [product]);

        const AutoCalc = () => {
            const { setFieldValue, values, isValid, setSubmitting, errors } = useFormikContext<ProductFormValuesDTO>();

            useEffect(() => {
                productService.calculateDraft(categoryName, values).then(({ sum, price }) => {
                    if (categoryName === 'bag') {
                        setFieldValue(
                            'fields.weight',
                            getWeightOfBag(
                                Number(values.fields.length),
                                Number(values.fields.width),
                                Number(values.fields.thickness),
                                Number(values.fields.quantity),
                            ),
                        );
                    }

                    console.log(price);

                    setFieldValue('price', price);
                    setFieldValue('totalAmount', sum);
                    setSubmitting(false);
                });
            }, [values, isValid]);

            return null;
        };
        return (
            <Formik
                validationSchema={schema}
                initialValues={initialValues}
                validateOnMount={true}
                enableReinitialize={true}
                onSubmit={onFormSubmit}
            >
                {({ isSubmitting, setFieldValue, values, errors, touched, handleBlur, handleChange }) => {
                    return (
                        <Form>
                            {!!product &&
                                product.modifiers &&
                                product.modifiers.map((item, index) => {
                                    const getError = (): string => {
                                        const error = errors.modifiers?.[item.id];
                                        const isTouched = touched.modifiers?.[item.id];

                                        return isTouched ? (error ?? '') : '';
                                    };

                                    return (
                                        <FormControl fullWidth margin="dense" key={item.id}>
                                            <InputLabel id={`modifierSelectLabel_${item.id}`}>{item.name}</InputLabel>
                                            <Select
                                                aria-labelledby={`modifierSelectLabel_${item.id}`}
                                                id={`modifier-select-${item.id}`}
                                                label={`modifier-select-${item.id}`}
                                                name={`modifiers.${item.id}`}
                                                value={values.modifiers?.[item.id] ?? ''}
                                                onChange={handleChange}
                                                error={!!getError()}
                                            >
                                                {item.list.map((i, itemIdx) => (
                                                    <MenuItem
                                                        key={itemIdx}
                                                        value={i.id}
                                                        sx={{ textTransform: 'capitalize' }}
                                                    >
                                                        {i.name} {i.price}грн.
                                                    </MenuItem>
                                                ))}
                                            </Select>

                                            <FormHelperText error={!!getError()}>{getError()}</FormHelperText>
                                        </FormControl>
                                    );
                                })}

                            {!!product && (
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', mx: '-8px' }}>
                                    {product.extendedFields?.map((field) => {
                                        const name = field.name as keyof ProductFormValuesDTO;
                                        const error = errors?.['fields']?.[name];
                                        const isTouched = touched.fields?.[name];
                                        return (
                                            <FormControl
                                                sx={{
                                                    flex: field.name === 'name' ? '2 1 100%' : '1 1 40%',
                                                    mx: '8px',
                                                }}
                                                margin="dense"
                                                key={name}
                                            >
                                                <TextField
                                                    placeholder={field.placeholder ?? field.placeholder}
                                                    disabled={categoryName === 'bag' && field.name === 'weight'}
                                                    name={`fields[${name}]`}
                                                    type={field.fieldType}
                                                    label={field.title}
                                                    value={values.fields[name] ?? ''}
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                    onFocus={(e) => {
                                                        if (e.target.value == '0')
                                                            setFieldValue(`fields[${name}]`, '', false);
                                                    }}
                                                    helperText={isTouched && typeof error === 'string' ? error : ''}
                                                    error={!!isTouched && !!error}
                                                />
                                            </FormControl>
                                        );
                                    })}
                                </Box>
                            )}
                            {!!values.price && (
                                <Typography variant="h6" sx={{ mt: 1 }} textAlign={'center'}>
                                    Ціна: <b>{priceFormat(values.price)}/кг</b>
                                </Typography>
                            )}

                            {!!product && <AutoCalc />}
                            <AppBar position="fixed" color="primary" sx={{ top: 'auto', bottom: 0 }}>
                                <Toolbar>
                                    <Button
                                        variant="outlined"
                                        sx={{ color: 'white', borderColor: 'white' }}
                                        fullWidth
                                        type={'submit'}
                                        disabled={!product}
                                    >
                                        Підтвердити | Сума:&nbsp;
                                        <b>{priceFormat(values.totalAmount)}</b>
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

    return (
        <Box>
            {!!categories && (
                <Categories
                    categories={categories}
                    value={categoryName ?? ''}
                    onChange={(e) => {
                        setCategoryName(e.target.value);
                    }}
                />
            )}

            {!!product && <FormComponent product={product} />}
        </Box>
    );
}
