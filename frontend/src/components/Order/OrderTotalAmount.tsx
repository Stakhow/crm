import { Typography } from '@mui/material';
import { priceFormat } from '../../../../utils/utils';

export const OrderTotalAmount = ({ totalAmount }: { totalAmount: number }) => {
    return (
        <Typography textAlign={'center'} gutterBottom variant="h6">
            Загальна cума: <b>{priceFormat(totalAmount)}</b>
        </Typography>
    );
};
