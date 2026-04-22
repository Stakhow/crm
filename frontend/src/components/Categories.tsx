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
    // Use a looser type that only requires target name and value
    onChange: (event: any) => void;
    value: any;
    name: string;
    error?: any;
} & Omit<SelectProps, 'onChange' | 'value' | 'error' | 'color' | 'size'>;

export const Categories = (props: CategoriesProps) => (
    <Card sx={{ p: 2 }} raised>
        <CategoriesField {...props} />
    </Card>
);

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
                value={value ?? ''}
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

export const CategoryWithState = () => {
    const { categories, categoryName, getCategories, isLoading, setCategory } = categoryStore((s) => s);

    useEffect(() => {
        if (!categoryName) getCategories();
    }, []);

    return (
        <Box>
            {isLoading ? (
                <Skeleton animation="wave" height={56} />
            ) : (
                <Categories
                    categories={categories}
                    name="categoryName"
                    onChange={(e) => {
                        setCategory(e.target.value);
                    }}
                    value={categoryName}
                />
            )}
        </Box>
    );
};
