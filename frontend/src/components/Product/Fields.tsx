import { Card, FormControl, InputLabel, MenuItem, Select, Stack, TextField } from '@mui/material';
import { FieldArray, getIn, useFormikContext } from 'formik';
import type { CreateProductUIDTO } from '../../../store/ProductStore';

export const Fields = () => {
    const { values, handleChange, handleBlur, errors } = useFormikContext<CreateProductUIDTO>();

    return (
        <FieldArray
            name="fields"
            render={() => (
                <Card sx={{ p: 2, mb: 2 }} raised>
                    <Stack direction={'row'} flexWrap={'wrap'} spacing={1} useFlexGap>
                        {values.fields.map((field, index) => {
                            const fieldName = `fields[${index}].value`;
                            const error = getIn(errors, fieldName);

                            if (field.fieldType === 'select') {
                                return (
                                    <FormControl key={index} fullWidth margin="dense">
                                        <InputLabel id={`SelectLabel_${fieldName}`}>{field.title}</InputLabel>
                                        <Select
                                            aria-labelledby={`SelectLabel_${fieldName}`}
                                            id={`select-${fieldName}`}
                                            label={field.title}
                                            name={fieldName}
                                            value={field.value}
                                            onChange={handleChange}
                                        >
                                            {!!field.values &&
                                                field.values.map((i) => (
                                                    <MenuItem
                                                        key={i.value}
                                                        value={i.value}
                                                        sx={{ textTransform: 'capitalize' }}
                                                    >
                                                        {i.title}
                                                    </MenuItem>
                                                ))}
                                        </Select>
                                    </FormControl>
                                );
                            }

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
                                        hiddenLabel={field.fieldType === 'hidden'}
                                        name={fieldName}
                                        type={field.fieldType}
                                        label={field.title}
                                        value={field.value}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        helperText={error}
                                        error={!!error}
                                    />
                                </FormControl>
                            );
                        })}
                    </Stack>
                </Card>
            )}
        ></FieldArray>
    );
};
