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
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/uk';
import { useState } from 'react';
import { calendarStore } from '../../store/index';
import updateLocale from 'dayjs/plugin/updateLocale';
import type { OrderViewUI } from '../../store/OrderStore';

dayjs.extend(updateLocale);
dayjs.updateLocale('uk', {
    weekStart: 1,
});

const withDateLocalization = <P extends object>(Component: React.ComponentType<P>) => {
    return (props: P) => (
        <LocalizationProvider
            dateAdapter={AdapterDayjs}
            adapterLocale="uk"
            localeText={ukUA.components.MuiLocalizationProvider.defaultProps.localeText}
        >
            <Component {...props} />
        </LocalizationProvider>
    );
};

const withCalendarState = <P extends object>(Component: React.ComponentType<P>) => {
    return (props: any) => {
        const { date, setDate } = calendarStore((s) => s);

        return (
            <Component
                {...(props as P)}
                value={date ? dayjs(date) : null}
                onChange={(v: Dayjs | null) => {
                    if (v) setDate(v);
                }}
            />
        );
    };
};

interface ServerDayProps extends PickerDayProps {
    monthOrders?: Map<number, OrderViewUI[]>;
}

function ServerDay(props: ServerDayProps) {
    const { day, outsideCurrentMonth, monthOrders, ...other } = props;

    const orders = monthOrders && !outsideCurrentMonth ? monthOrders.get(day.date()) : undefined;

    const isPast = day.isBefore(dayjs(), 'day');

    let badgeColor: ButtonProps['color'] = 'info';

    if (orders && orders.length > 0) {
        if (orders.some((i) => i.status === 'InProgress')) badgeColor = 'error';
        if (orders.every((i) => i.status === 'Done')) badgeColor = 'success';
    }

    return (
        <Badge
            key={day.toString()}
            overlap="circular"
            color={isPast ? 'info' : badgeColor}
            badgeContent={orders ? orders.length : undefined}
            sx={{
                '& .MuiBadge-badge': {
                    boxShadow: '1px 1px 3px 1px rgba(0, 0, 0, 0.4)',
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

const CalendarInputBase = ({ error, ...props }: any) => {
    const [open, setOpen] = useState(false);

    return (
        <DatePicker
            open={open}
            onOpen={() => setOpen(true)}
            onClose={() => setOpen(false)}
            format="DD.MM.YYYY"
            slotProps={{
                textField: {
                    readOnly: true,
                    onClick: () => setOpen(true),
                    error: error ?? false,
                    helperText: error ? "Поле обов'язкове" : '',
                },
            }}
            {...props}
        />
    );
};

export const CalendarInput = withDateLocalization(CalendarInputBase);

type CalendarBaseProps = {
    value: Dayjs | null;
    onChange: (v: Dayjs | null) => void;
    isLoading: boolean;
    monthOrders: Map<number, OrderViewUI[]> | null;
};

const CalendarBase = ({ isLoading, monthOrders, ...props }: CalendarBaseProps) => {
    return (
        <DateCalendar
            loading={isLoading}
            dayOfWeekFormatter={(weekday) => `${weekday.format('dd')}.`}
            renderLoading={() => <DayCalendarSkeleton />}
            showDaysOutsideCurrentMonth={false}
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
                day: ServerDay,
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

const Calendar = withDateLocalization(CalendarBase);

export const CalendarInputState = withCalendarState(CalendarInput);
export const CalendarWithState = withCalendarState(Calendar);
