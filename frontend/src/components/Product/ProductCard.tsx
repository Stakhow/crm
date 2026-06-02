import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { priceFormat, quantityFormat } from '../../../../utils/utils';
import type { ProductViewUIDTO } from '../../../../dto/ProductViewDTO';
import type { ReactNode } from 'react';
import { Button, Divider, Stack } from '@mui/material';
import { NavLink } from 'react-router';
import { Details } from './Details';

type ProductCard = React.ComponentProps<'button'> & {
    variant: 'primary' | 'secondary';
};
export type ProductCardProps = {
    product: ProductViewUIDTO;
    children?: ReactNode;
    showProductButton?: boolean;
};
export function ProductCard({ product, children, showProductButton = true }: ProductCardProps) {
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
                <Typography gutterBottom variant="h5" component={'h1'}>
                    {product.name}
                </Typography>

                <Divider sx={{ my: 1 }} />

                {!!product.fields.length && (
                    <>
                        <Details data={product.fields} />
                        <Divider sx={{ my: 2 }} />
                    </>
                )}

                <Details
                    data={[
                        { title: 'Доступно на складі', value: quantityFormat(product.quantity, product.unit) },
                        { title: 'Ціна', value: `${priceFormat(product.price)}/кг` },
                        { title: 'Вартість', value: priceFormat(product.totalAmount) },
                    ]}
                    sx={{ color: 'text.primary' }}
                />
            </CardContent>
            <Stack direction={'column'} sx={{ p: 2 }} spacing={2}>
                {showProductButton && (
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
export function ProductProduceCard({ product, children }: ProductCardProps) {
    return (
        <Card
            sx={{
                minWidth: 275,
                my: 2,
            }}
            raised
        >
            <CardContent>
                <Typography gutterBottom variant="h5" component={'h1'}>
                    {product.name}
                </Typography>

                <Divider sx={{ my: 1 }} />

                {!!product.fields.length && (
                    <>
                        <Details data={product.fields} />
                        <Divider sx={{ my: 2 }} />
                    </>
                )}

                <Details
                    data={[{ title: 'Виготовити', value: quantityFormat(product.quantity, product.unit) }]}
                    sx={{ color: 'text.primary' }}
                />
            </CardContent>
            <Stack direction={'column'} sx={{ p: 2 }} spacing={2}>
                {children}
            </Stack>
        </Card>
    );
}
