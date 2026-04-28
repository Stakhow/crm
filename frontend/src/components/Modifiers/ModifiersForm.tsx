import { Typography, Card, FormControl, TextField, Button } from '@mui/material';
import { Formik, Form, FieldArray, getIn } from 'formik';

import { BottomBar } from '../BottomBar';
import { CategoriesField } from '../Categories';
import { validationSchema } from './validationSchema';
import { categoryStore } from '../../../store';
import type { ProductModifierProps } from '../../../../backend/domain/product/modifiers/ProductModifier';
import type { ProductModifierDTO } from '../../../../dto/ProductModifierDTO';
import { useEffect } from 'react';

type ModifierFormProps = {
    modifier: ProductModifierDTO;
    submitHandler: (values: ProductModifierProps) => void;
};

export const ModifierForm = ({ modifier, submitHandler }: ModifierFormProps) => {
    const { setCategories, getCategories, categories, categoryNames } = categoryStore((s) => s);

    useEffect(() => {
        getCategories();
    }, []);

    useEffect(() => {
        if (!!modifier) setCategories(modifier.categories);
    }, [modifier]);

    return (
        <Formik validationSchema={validationSchema} initialValues={modifier} onSubmit={submitHandler}>
            {({ values, errors, handleChange, touched }) => {
                return (
                    <Form>
                        <Card sx={{ p: 2, mb: 2 }} raised>
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

                            <CategoriesField
                                multiple={true}
                                name={'categories'}
                                onChange={(e: React.ChangeEvent<any>) => {
                                    setCategories(e.target.value);

                                    handleChange(e);
                                }}
                                categories={categories}
                                value={categoryNames}
                            />
                        </Card>

                        <Typography variant="h6" mt={1} textAlign={'center'}>
                            Варіанти:
                        </Typography>

                        <FieldArray
                            name="list"
                            render={(arrayHelpers) => (
                                <Card sx={{ p: 2, mb: 2 }} raised>
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
                                                <Card sx={{ p: 1, mb: 2 }} key={index} raised={true}>
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
                                                            disabled={values.list.length === 1 || !!item.id}
                                                            size={'large'}
                                                            variant="outlined"
                                                            fullWidth
                                                            color="error"
                                                            onClick={() => arrayHelpers.remove(index)}
                                                        >
                                                            Видалити Варіант
                                                        </Button>
                                                    </FormControl>
                                                </Card>
                                            );
                                        })}

                                    <FormControl margin="dense" fullWidth>
                                        <Button
                                            variant="contained"
                                            fullWidth
                                            size={'large'}
                                            onClick={() =>
                                                arrayHelpers.push({
                                                    name: '',
                                                    price: '',
                                                })
                                            }
                                            color="info"
                                        >
                                            Додати Варіант
                                        </Button>
                                    </FormControl>
                                </Card>
                            )}
                        />

                        <BottomBar>
                            <Button variant="contained" fullWidth color={'success'} type={'submit'} size={'large'}>
                                Зберегти
                            </Button>
                        </BottomBar>
                    </Form>
                );
            }}
        </Formik>
    );
};
