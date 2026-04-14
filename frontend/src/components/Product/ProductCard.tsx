import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { dateToLocalString, priceFormat } from '../../../../utils/utils';
import type { ProductViewDTO } from '../../../../dto/ProductViewDTO';

import type { ReactNode } from 'react';

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
                    boxShadow: '0px 5px 15px rgba(255, 0, 0, 0.3)',
                }),
            }}
            raised
        >
            <CardContent>
                <Typography gutterBottom variant="h5" component="div">
                    {product.name}
                </Typography>

                <small>ID: {product.id}</small>

                <Details data={product.modifiers} />

                <Details data={product.fields} />

                {!!product.createdAt && <Typography>Створено: {dateToLocalString(product.createdAt)}</Typography>}

                <hr />

                <Typography>
                    {isInCart ? 'Вага' : 'Доступно на складі'}
                    {product.categoryName === 'bag' ? ' (шт.): ' : ' (кг): '}
                    <b>{product.quantity ?? 0}</b>
                </Typography>

                <Typography>
                    Ціна за кг: <b>{priceFormat(product.price)}</b>
                </Typography>

                <Typography>
                    Вартість: <b>{priceFormat(product.totalAmount)}</b>
                </Typography>

                <Typography variant="body2">{}</Typography>
            </CardContent>
            {children}
        </Card>
    );
}
