import {
    Box,
    Card,
    FormControl,
    FormHelperText,
    InputLabel,
    MenuItem,
    OutlinedInput,
    Select,
    Skeleton,
    type SelectProps,
} from '@mui/material';
import type { ProductCategory } from '../../../backend/domain/product/ProductCategory';
import { categoryStore } from '../../store';
import { useEffect } from 'react';

type CategoriesProps = {
    categories: { name: ProductCategory; title: string }[];
    onChange: (event: any) => void;
    value: ProductCategory | ProductCategory[];
    name: string;
    error?: any;
} & Omit<SelectProps, 'onChange' | 'value' | 'error' | 'color' | 'size'>;

export function CategoriesField({
    categories,
    value,
    onChange,
    multiple = false,
    error,
    name,
    ...rest
}: CategoriesProps) {
    const categoriesItems = categories.map((category, idx) => (
        <MenuItem key={++idx} value={category.name} sx={{ textTransform: 'capitalize' }}>
            {category.title}
        </MenuItem>
    ));

    const multipleSelect = multiple
        ? {
              input: <OutlinedInput />,
          }
        : {};

    const _value = multiple ? (value ?? []) : (value ?? '');

    return (
        <FormControl fullWidth margin="dense">
            <InputLabel id={`categorySelectLabel-${name}`}>Категорії</InputLabel>
            <Select
                multiple={multiple}
                aria-labelledby={`categorySelectLabel-${name}`}
                onChange={onChange}
                id={`category-select-${name}`}
                name={name}
                label="Категорії"
                value={_value}
                error={!!error}
                {...multipleSelect}
                {...rest}
            >
                {categoriesItems}
            </Select>

            {!!error && <FormHelperText error>{error}</FormHelperText>}
        </FormControl>
    );
}

export const CategoryWithState = ({ ...rest }) => {
    const { categories, categoryName, getCategories, isLoading, setCategory } = categoryStore((s) => s);

    useEffect(() => {
        if (!categoryName) getCategories();
    }, []);

    return (
        <Box>
            {isLoading ? (
                <Skeleton animation="wave" height={56} />
            ) : (
                <Card sx={{ p: 2, mb: 2 }} raised>
                    <CategoriesField
                        categories={categories}
                        name="categoryName"
                        onChange={(e) => {
                            setCategory(e.target.value);
                        }}
                        value={categoryName}
                        {...rest}
                    />
                </Card>
            )}
        </Box>
    );
};
