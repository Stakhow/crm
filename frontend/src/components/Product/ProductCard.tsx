import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { dateToLocalString, priceFormat } from '../../../../utils/utils';
import type { ProductViewDTO } from '../../../../dto/ProductViewDTO';
import type { ReactNode } from 'react';
import { Divider } from '@mui/material';

export function ProductCard({
    product,
    children,
    isInCart,
}: {
    product: ProductViewDTO;
    children?: ReactNode;
    isInCart?: boolean;
}) {
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
            </CardContent>
            {children}
        </Card>
    );
}
