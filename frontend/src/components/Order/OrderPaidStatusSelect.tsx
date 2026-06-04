import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import type { OrderQuery } from '../../../../dto/OrderQuery';

export const OrderPaidStatusSelect = ({
    value,
    onChange,
}: {
    value: OrderQuery['paid'];
    onChange: (value: OrderQuery['paid']) => void;
}) => {
    return (
        <FormControl fullWidth margin="dense">
            <InputLabel id={`SelectLabel_paid`}>Статус оплати</InputLabel>
            <Select
                aria-labelledby={`SelectLabel_paid`}
                id={`select-paid`}
                label={'Статус оплати'}
                name={'paid'}
                value={value}
                onChange={(e) => {
                    return onChange(e.target.value);
                }}
            >
                <MenuItem key={0} value={'all'} sx={{ textTransform: 'capitalize' }}>
                    Усі
                </MenuItem>
                <MenuItem key={1} value={'unpaid'} sx={{ textTransform: 'capitalize' }}>
                    Неоплачені
                </MenuItem>
                <MenuItem key={2} value={'paid'} sx={{ textTransform: 'capitalize' }}>
                    Оплачені
                </MenuItem>
            </Select>
        </FormControl>
    );
};
