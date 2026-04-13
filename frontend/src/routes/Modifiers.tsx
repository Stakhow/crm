import {
    Button,
    Paper,
    Tooltip,
    Typography,
    DialogContent,
    FormControl,
    TextField,
    Stack,
    List,
    ListItem,
    ListItemText,
    Dialog,
} from '@mui/material';
import { useEffect, useState, type ReactNode } from 'react';
import { productService } from '../../../backend';
import type { ProductModifierDTO } from '../../../dto/ProductModifierDTO';
import { priceFormat } from '../../../utils/utils';
import * as Yup from 'yup';

import DialogTitle from '@mui/material/DialogTitle';
import { Formik, type FormikHelpers, Form, FieldArray, getIn } from 'formik';
import { Categories } from '../components/Categories';
import { grey } from '@mui/material/colors';
import type { ProductCategory } from '../../../backend/domain/product/ProductCategory';
import type { ProductModifierItemDTO } from '../../../dto/ProductModifierItemDTO';
import { useNotification } from '../components/NotificationContext';
import type { ProductCategoryDTO } from '../../../dto/ProductCategoryDTO';
import { NavLink } from 'react-router';

export interface DialogProps {
    open: boolean;
    modifier?: ProductModifierDTO;
    onClose: () => void;
    children?: ReactNode;
}

interface Values {
    id?: number;
    name: string;
    category: ProductCategory[];
    list: ProductModifierItemDTO[];
}

export default function Modifiers() {
    const [modifiers, setModifiers] = useState<ProductModifierDTO[]>([]);
    const [modifier, setModifier] = useState<ProductModifierDTO>();
    const [open, setOpen] = useState(false);
    const [categories, setCategories] = useState<ProductCategoryDTO[]>([]);
    const [categoriesMap, setCategoriesMap] = useState<Map<string, ProductCategoryDTO>>();

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setModifier(undefined);
    };

    const deleteModifier = (modId: number) => {
        productService
            .deleteModifier(modId)
            .then(() => {
                notify({ message: `Модифікатор успішно видалено`, severity: 'success' });
                setModifiers((prev) => prev.filter((i) => i.id !== modId));
            })
            .catch((error) => {
                notify({
                    message: (
                        <>
                            Помилка, модифікатор використовується в продуктах:
                            {error.details.data.map((i: number) => (
                                <Button
                                    variant="contained"
                                    size="small"
                                    color="info"
                                    key={i}
                                    component={NavLink}
                                    to={`/products/${i}`}
                                >
                                    Продукт ID: {i}
                                </Button>
                            ))}
                        </>
                    ),
                    severity: 'error',
                });
            });
    };

    const { notify } = useNotification();

    useEffect(() => {
        productService.getCategories().then((categories) => {
            const mods = new Map();
            categories.map((i) => mods.set(i.name, i.title));
            setCategoriesMap(mods);
            setCategories(categories);
            productService.getAllModifiers().then((mods) => {
                setModifiers(mods);
            });
        });
    }, []);

    function DialogComponent({ open, modifier }: DialogProps) {
        const isEditMode = !!modifier && !!modifier.id;

        const initialValues: Values = isEditMode
            ? modifier
            : {
                  id: 0,
                  name: '',
                  category: [],
                  list: [{ id: 0, name: '', price: 0 }],
              };

        const variant = Yup.object().shape({
            name: Yup.string().required("Поле обов'язкове"),
            price: Yup.number().min(0, 'Не менше ніж нуль'),
        });

        const schema = Yup.object().shape({
            category: Yup.array().min(1, "Поле обов'язкове").required("Поле обов'язкове"),
            name: Yup.string().required("Поле обов'язкове"),
            list: Yup.array().of(variant).min(1, 'Мінімум один варіант').required("Поле обов'язкове"),
        });

        console.log({ initialValues });

        return (
            <Dialog onClose={handleClose} open={open}>
                <DialogTitle textAlign={'center'}>
                    {isEditMode ? `Редагування: ${modifier.name}` : 'Новий модифікатор'}
                </DialogTitle>
                <DialogContent>
                    <Formik
                        enableReinitialize={true}
                        validateOnMount={true}
                        validationSchema={schema}
                        initialValues={initialValues}
                        onSubmit={(values: Values, { setSubmitting, resetForm }: FormikHelpers<Values>) => {
                            setTimeout(() => {
                                const msg = isEditMode ? 'оновлено' : 'створено';

                                const send = () => {
                                    const params = {
                                        name: values.name,
                                        categories: values.category,
                                        list: values.list,
                                    };
                                    return isEditMode && values.id
                                        ? productService.updateModifier({ ...params, id: values.id })
                                        : productService.saveModifier(params);
                                };

                                send()
                                    .then((modId) => {
                                        resetForm();
                                        setOpen(false);

                                        notify({ message: `Модифікатор успішно ${msg}`, severity: 'success' });

                                        productService.getModifier(modId).then((mod) => {
                                            if (isEditMode) {
                                                setModifiers((prev) => prev.map((i) => (i.id === modId ? mod : i)));
                                            } else setModifiers([...modifiers, mod]);
                                        });
                                    })
                                    .catch((error) => {
                                        console.log(error);
                                        notify({ message: `Виникла помилка`, severity: 'error' });
                                    });

                                setSubmitting(false);
                            }, 500);
                        }}
                    >
                        {({ setFieldValue, values, errors, handleChange, touched }) => {
                            return (
                                <Form>
                                    <FormControl margin="dense" fullWidth>
                                        <TextField
                                            name="name"
                                            value={values.name}
                                            type="text"
                                            label="Назва Модифікатора"
                                            onChange={handleChange}
                                            helperText={errors['name']}
                                            error={!!errors['name']}
                                        />
                                    </FormControl>

                                    <Categories
                                        name={'categoryName'}
                                        categories={categories}
                                        value={values.category}
                                        onChange={(e) => {
                                            setFieldValue('category', e.target.value);
                                        }}
                                        multiple={true}
                                        error={errors['category']}
                                        disabled={isEditMode}
                                    />

                                    <Typography variant="h6" mt={1} textAlign={'center'}>
                                        Варіанти:
                                    </Typography>

                                    <FieldArray
                                        name="list"
                                        render={(arrayHelpers) => (
                                            <Paper variant="outlined" sx={{ p: 2, bgcolor: grey[200] }}>
                                                {values.list &&
                                                    values.list.length > 0 &&
                                                    values.list.map((item, index) => {
                                                        const nameError = getIn(errors, `list.${index}.name`);
                                                        const nameValue = getIn(values, `list.${index}.name`);
                                                        const isNameTouched = getIn(touched, `list.${index}.name`);

                                                        const priceError = getIn(errors, `list.${index}.price`);
                                                        const priceValue = getIn(values, `list.${index}.price`);
                                                        const isPriceTouched = getIn(touched, `list.${index}.price`);

                                                        return (
                                                            <Paper sx={{ p: 2, mb: 2 }} variant="outlined" key={index}>
                                                                <TextField
                                                                    name={`list.${index}.id`}
                                                                    value={item.id ?? index}
                                                                    type="hidden"
                                                                    sx={{ display: 'none' }}
                                                                />

                                                                <FormControl margin="dense" fullWidth>
                                                                    <TextField
                                                                        size={'small'}
                                                                        name={`list.${index}.name`}
                                                                        value={nameValue}
                                                                        onChange={handleChange}
                                                                        type={'text'}
                                                                        label={'Назва варіанту'}
                                                                        helperText={!!isNameTouched && nameError}
                                                                        error={!!isNameTouched && nameError}
                                                                    />
                                                                </FormControl>
                                                                <FormControl margin="dense" fullWidth>
                                                                    <TextField
                                                                        size={'small'}
                                                                        name={`list.${index}.price`}
                                                                        value={priceValue}
                                                                        onChange={handleChange}
                                                                        type={'number'}
                                                                        label={'Ціна(грн./кг)'}
                                                                        helperText={!!isPriceTouched && priceError}
                                                                        error={!!isPriceTouched && priceError}
                                                                    />
                                                                </FormControl>

                                                                <FormControl margin="dense" fullWidth>
                                                                    <Button
                                                                        disabled={
                                                                            values.list.length === 1 || isEditMode
                                                                        }
                                                                        size={'small'}
                                                                        variant="outlined"
                                                                        fullWidth
                                                                        onClick={() => arrayHelpers.remove(index)}
                                                                    >
                                                                        Видалити Варіант
                                                                    </Button>
                                                                </FormControl>
                                                            </Paper>
                                                        );
                                                    })}

                                                <FormControl margin="dense" fullWidth>
                                                    <Button
                                                        variant="contained"
                                                        fullWidth
                                                        onClick={() => arrayHelpers.push({ name: '', price: '' })}
                                                        color="info"
                                                    >
                                                        Додати Варіант
                                                    </Button>
                                                </FormControl>
                                            </Paper>
                                        )}
                                    />

                                    <Stack direction={'row'} my={2} spacing={1}>
                                        <Button variant="outlined" fullWidth color={'success'} type={'submit'}>
                                            {isEditMode ? 'Оновити' : 'Зберегти'}
                                        </Button>
                                        <Button variant="outlined" fullWidth color={'info'} onClick={handleClose}>
                                            Відміна
                                        </Button>
                                    </Stack>
                                </Form>
                            );
                        }}
                    </Formik>
                </DialogContent>
            </Dialog>
        );
    }

    const Modifier = ({ data }: { data: ProductModifierDTO }) => {
        const categories = data.category.map((i) => categoriesMap?.get(i)).join(', ');

        return (
            <Paper sx={{ p: 2, mb: 2 }}>
                <Typography>
                    <b>ID:</b> {data.id}
                </Typography>
                <Typography>
                    <b>Назва:</b> {data.name}
                </Typography>
                <Typography>
                    <Tooltip title="Категорії товарів до яких застосовується">
                        <Typography
                            component="span"
                            sx={{
                                textDecorationLine: 'underline',
                                textDecorationStyle: 'dotted',
                                fontWeight: 700,
                            }}
                        >
                            Категорії:{' '}
                        </Typography>
                    </Tooltip>

                    {categories}
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
                        onClick={() => {
                            setOpen(true);
                            setModifier(data);
                        }}
                    >
                        Редагувати
                    </Button>
                    <Button
                        variant="outlined"
                        fullWidth
                        color={'error'}
                        onClick={() => {
                            deleteModifier(data.id);
                        }}
                    >
                        Видалити
                    </Button>
                </Stack>
            </Paper>
        );
    };

    return (
        <>
            <Typography component={'h1'} variant="h5" textAlign={'center'}>
                Модифікатори ціни:
            </Typography>

            <Stack direction="row" justifyContent={'center'} useFlexGap my={2}>
                <Button variant="contained" onClick={handleClickOpen}>
                    Додати Модифікатор
                </Button>
            </Stack>

            {!!modifiers && !!modifiers.length && categories && modifiers.map((i) => <Modifier key={i.id} data={i} />)}

            <DialogComponent open={open} onClose={handleClose} modifier={modifier} />
        </>
    );
}
