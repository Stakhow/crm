import type { ButtonProps } from '@mui/material';
import { Badge } from '@mui/material';
import { grey } from '@mui/material/colors';
import {
    DatePicker,
    DateCalendar,
    LocalizationProvider,
    DayCalendarSkeleton,
    PickerDay,
    type PickerDayProps,
} from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { ukUA } from '@mui/x-date-pickers/locales';
import dayjs from 'dayjs';
import 'dayjs/locale/uk';

import { useState } from 'react';
import type { OrderViewDTO } from '../../../dto/OrderViewDTO';
import type { PickerValue } from '@mui/x-date-pickers/internals';

const withDateLocalization = (Component: React.ComponentType<any>) => {
    return (props: any) => (
        <LocalizationProvider
            dateAdapter={AdapterDayjs}
            adapterLocale="uk"
            localeText={ukUA.components.MuiLocalizationProvider.defaultProps.localeText}
        >
            <Component {...props} />
        </LocalizationProvider>
    );
};

function ServerDay(props: PickerDayProps & { monthOrders: Map<number, OrderViewDTO[]> }) {
    const { day, outsideCurrentMonth, ...other } = props;

    const orders = props.monthOrders ? props.monthOrders.get(day.date()) : undefined;
    const isPast = day.isBefore(dayjs(), 'day');

    let color: ButtonProps['color'] = 'info';

    if (orders) {
        if (orders.some((i) => i.status === 'InProgress')) color = 'error';
        if (orders.every((i) => i.status === 'Done')) color = 'success';
    }

    return (
        <Badge
            key={props.day.toString()}
            overlap="circular"
            color={isPast ? 'info' : color}
            badgeContent={orders ? orders.length : undefined}
            sx={{
                '& .MuiBadge-badge': {
                    boxShadow: '1px 1px 3px 1px rgba(0, 0, 0, 0.7)',
                },
                '& .MuiBadge-colorInfo': {
                    backgroundColor: grey[500],
                },
            }}
        >
            <PickerDay {...other} outsideCurrentMonth={outsideCurrentMonth} day={day} />
        </Badge>
    );
}

const CalendarInputBase = ({ ...props }) => {
    const [open, setOpen] = useState(false);

    return (
        <DatePicker
            open={open}
            onOpen={() => setOpen(true)}
            onClose={() => setOpen(false)}
            value={props.value}
            format="DD.MM.YYYY"
            slotProps={{
                textField: {
                    readOnly: true,
                    contentEditable: false,
                    onClick: () => setOpen(true),
                    error: props.error ?? false,
                    helperText: props.error ? "Поле обов'язкове" : '',
                },
            }}
            {...props}
        />
    );
};

export const CalendarInput = withDateLocalization(CalendarInputBase);

type CalendarBaseProps = {
    date: PickerValue;
    isLoading: boolean;
    monthOrders: Map<number, OrderViewDTO[]>;
};
const CalendarBase = ({ date, isLoading, monthOrders, ...props }: CalendarBaseProps) => {
    return (
        <DateCalendar
            value={date}
            defaultValue={date}
            loading={isLoading}
            dayOfWeekFormatter={(weekday) => `${weekday.format('dd')}.`}
            renderLoading={() => <DayCalendarSkeleton />}
            sx={{
                width: '100%',
                maxWidth: '400px',
                '& .MuiDayCalendar-slideTransition': {
                    minHeight: '400px',
                },
                '& .MuiDayCalendar-weekDayLabel': {
                    fontSize: '1rem',
                },
            }}
            slots={{
                day: ServerDay as any,
            }}
            slotProps={{
                day: {
                    monthOrders,
                    sx: {
                        width: '42px',
                        height: '42px',
                        fontSize: '1rem',
                    },
                } as any,
            }}
            {...props}
        />
    );
};

export const Calendar = withDateLocalization(CalendarBase);
