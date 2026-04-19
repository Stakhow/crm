import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { dateToLocalString, priceFormat } from '../../../../utils/utils';
import type { ProductViewDTO } from '../../../../dto/ProductViewDTO';
import type { ReactNode } from 'react';
import { Button, Divider, Stack } from '@mui/material';
import { NavLink } from 'react-router';

type ProductCard = React.ComponentProps<'button'> & {
    variant: 'primary' | 'secondary';
};
export type ProductCardProps = {
    product: ProductViewDTO;
    children?: ReactNode;
    isInCart?: boolean;
    isProductPage?: boolean;
};
export function ProductCard({ product, children, isInCart, isProductPage }: ProductCardProps) {
    const Details = ({ data }: { data: { title: string; value: string | number; price?: number }[] }) =>
        !!data &&
        data.map(({ title, value, price }, idx) => (
            <Typography key={idx} sx={{ color: 'text.secondary' }}>
                {title}: <b>{value}</b> {price ? priceFormat(price) : ''}
            </Typography>
        ));

    return (
        <Card
            sx={{
                minWidth: 275,
                my: 2,
                ...(!product.quantity && {
                    border: '3px dashed rgba(255, 0, 0, .8)',
                }),
            }}
            raised
        >
            <CardContent>
                <Typography gutterBottom variant="h5" component="div">
                    {product.name}
                </Typography>

                <Divider sx={{ my: 1 }} />

                <small>ID: {product.id}</small>

                <Details data={product.modifiers} />

                <Details data={product.fields} />

                {!!product.createdAt && <Typography>Створено: {dateToLocalString(product.createdAt)}</Typography>}

                <Divider sx={{ my: 2 }} />

                <Typography>
                    {isInCart ? 'Вага' : 'Доступно на складі'}
                    {product.categoryName === 'bag' ? ' (шт.): ' : ' (кг): '}
                    <b>{product.quantity ?? 0}</b>
                </Typography>

                <Typography>
                    Ціна за кг: <b>{priceFormat(product.price)}</b>
                </Typography>

                <Typography gutterBottom>
                    Вартість: <b>{priceFormat(product.totalAmount)}</b>
                </Typography>

                {!product.quantity && (
                    <Typography textAlign={'center'} color="error" gutterBottom={true}>
                        Продукт Закінчився
                    </Typography>
                )}
            </CardContent>
            <Stack direction={'column'} sx={{ p: 2 }} spacing={2}>
                {!isProductPage && (
                    <Button
                        color="warning"
                        size="large"
                        fullWidth
                        to={`/products/${product.id}`}
                        component={NavLink}
                        variant="outlined"
                    >
                        Переглянути
                    </Button>
                )}

                {children}
            </Stack>
        </Card>
    );
}
