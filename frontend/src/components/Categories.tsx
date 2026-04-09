import { FormControl, FormHelperText, InputLabel, MenuItem, OutlinedInput, Select } from '@mui/material';
import type { ProductCategory } from '../../../backend/domain/product/ProductCategory';

type CategoriesProps = {
    categories: { name: ProductCategory; title: string }[];
    value: string | string[];
    name: string;
    onChange: (e: any) => void;
    multiple?: boolean;
    error?: string | string[] | undefined;
};

export function Categories({ categories, value, onChange, multiple = false, error, name, ...rest }: CategoriesProps) {
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
                onChange={(e) => {
                    onChange(e);
                }}
                id={`category-select-${name}`}
                name={name}
                label="Категорії"
                value={value}
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
