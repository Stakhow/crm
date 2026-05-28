import { Card, FormControl, Stack, TextField } from '@mui/material';
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
