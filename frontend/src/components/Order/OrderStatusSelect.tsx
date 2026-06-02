import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { useState } from 'react';
import type { OrderViewUI } from '../../../store/OrderStore';

export const OrderStatusSelect = ({
    title,
    options,
    name,
    value,
    onChange,
}: {
    title: string;
    name: string;
    value: OrderViewUI['status'];
    options: OrderViewUI['statuses'];
    onChange: (value: OrderViewUI['status']) => void;
}) => {
    const [selected, setSelected] = useState<OrderViewUI['status']>(value);

    return (
        <FormControl fullWidth margin="dense">
            <InputLabel id={`modifierSelectLabel_${name}`}>{title}</InputLabel>
            <Select
                aria-labelledby={`modifierSelectLabel_${name}`}
                id={`modifier-select-${name}`}
                label={title}
                name={name}
                value={selected}
                onChange={(e) => {
                    setSelected(e.target.value);
                    onChange(e.target.value);
                }}
            >
                {options.map((i, itemIdx) => (
                    <MenuItem key={itemIdx} value={i.value} sx={{ textTransform: 'capitalize' }}>
                        {i.title}
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    );
};
