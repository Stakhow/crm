import { MenuItem, Chip, Card, FormControl, InputLabel, Select, Skeleton } from '@mui/material';
import { productStore } from '../../../store';

export const ProductListSelect = ({ cartItemsId = [] }: { cartItemsId?: string[] }) => {
    const { products, isLoading, productId, selectProduct } = productStore((s) => s);

    const options = products.map((product, itemIdx) => {
        const inСart = cartItemsId.includes(product.id);

        return (
            <MenuItem key={itemIdx} value={product.id} disabled={inСart}>
                {product.name}

                {inСart && <Chip sx={{ ml: 1 }} label="Уже в корзині" />}
                {/* {!product.isAvailable && <Chip color="error" sx={{ ml: 1 }} label="Закінчився" />} */}
            </MenuItem>
        );
    });

    options.unshift(
        <MenuItem key={'new'} value={'new'}>
            Створити новий
        </MenuItem>,
    );

    const List = () =>
        !!products &&
        !!products.length && (
            <Card sx={{ p: 2 }} raised>
                <FormControl fullWidth margin="dense">
                    <InputLabel>{'Список продуктів'}</InputLabel>
                    <Select
                        label={'Список продуктів'}
                        value={productId ?? ''}
                        id={'id'}
                        onChange={(e) => {
                            selectProduct(e.target.value);
                        }}
                    >
                        {options}
                    </Select>
                </FormControl>
            </Card>
        );

    return isLoading ? <Skeleton variant="rounded" height={102} component={Card} /> : <List />;
};
