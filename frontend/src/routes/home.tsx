import * as React from 'react';
import dayjs, { Dayjs } from 'dayjs';
import Badge from '@mui/material/Badge';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { PickerDay, type PickerDayProps } from '@mui/x-date-pickers/PickerDay';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { DayCalendarSkeleton } from '@mui/x-date-pickers/DayCalendarSkeleton';
import { Box, Button, Paper, Stack } from '@mui/material';
import type { PickerValue } from '@mui/x-date-pickers/internals';
import updateLocale from 'dayjs/plugin/updateLocale';
import { DatePicker } from '@mui/x-date-pickers';
import { orderService } from '../../../backend';

dayjs.extend(updateLocale);

// Replace "en" with the name of the locale you want to update.
dayjs.updateLocale('en', {
    // Sunday = 0, Monday = 1.
    weekStart: 1,
});

function getRandomNumber(min: number, max: number) {
    // eslint-disable-next-line no-restricted-properties -- used for interactive server simulation
    return Math.round(Math.random() * (max - min) + min);
}

/**
 * Mimic fetch with abort controller https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort
 * ⚠️ No IE11 support
 */
function fakeFetch(date: Dayjs, { signal }: { signal: AbortSignal }) {
    return new Promise<{ daysToHighlight: number[] }>((resolve, reject) => {
        const timeout = setTimeout(() => {
            const daysInMonth = date.daysInMonth();
            const daysToHighlight = [1, 2, 3].map(() => getRandomNumber(1, daysInMonth));

            resolve({ daysToHighlight });
        }, 500);

        signal.onabort = () => {
            clearTimeout(timeout);
            reject(new DOMException('aborted', 'AbortError'));
        };
    });
}

const initialValue = dayjs();

function ServerDay(props: PickerDayProps & { highlightedDays?: number[] }) {
    const { highlightedDays = [], day, outsideCurrentMonth, ...other } = props;

    const isSelected = !props.outsideCurrentMonth && highlightedDays.indexOf(props.day.date()) >= 0;

    return (
        <Badge key={props.day.toString()} overlap="circular" color="error" badgeContent={isSelected ? '2' : undefined}>
            <PickerDay {...other} outsideCurrentMonth={outsideCurrentMonth} day={day} />
        </Badge>
    );
}

export default function Home() {
    const requestAbortController = React.useRef<AbortController | null>(null);
    const [isLoading, setIsLoading] = React.useState(false);
    const [highlightedDays, setHighlightedDays] = React.useState([1, 2, 15]);
    const [date, setDate] = React.useState<PickerValue | null>(dayjs());

    const fetchHighlightedDays = (date: Dayjs) => {
        const controller = new AbortController();
        fakeFetch(date, {
            signal: controller.signal,
        })
            .then(({ daysToHighlight }) => {
                setHighlightedDays(daysToHighlight);
                setIsLoading(false);
            })
            .catch((error) => {
                // ignore the error if it's caused by `controller.abort`
                if (error.name !== 'AbortError') {
                    throw error;
                }
            });

        requestAbortController.current = controller;
    };

    React.useEffect(() => {
        fetchHighlightedDays(initialValue);
        // abort request on unmount
        return () => requestAbortController.current?.abort();
    }, []);

    React.useEffect(() => {
        if (date)
            orderService.getAllByTargetDate(date.valueOf()).then((data) => {
                console.log('orders', data);
            });
    }, [date]);

    const handleMonthChange = (date: Dayjs) => {
        if (requestAbortController.current) {
            // make sure that you are aborting useless requests
            // because it is possible to switch between months pretty quickly
            requestAbortController.current.abort();
        }

        setIsLoading(true);
        setHighlightedDays([]);
        fetchHighlightedDays(date);
    };

    return (
        <Paper sx={{ p: 2 }}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DateCalendar
                    value={date}
                    defaultValue={initialValue}
                    loading={isLoading}
                    onMonthChange={handleMonthChange}
                    dayOfWeekFormatter={(weekday) => `${weekday.format('dd')}.`}
                    renderLoading={() => <DayCalendarSkeleton />}
                    onChange={(newValue) => setDate(newValue)}
                    sx={{
                        width: '100%',
                        // padding: '0 20px'
                        maxWidth: '400px',
                        '& .MuiDayCalendar-slideTransition': {
                            minHeight: '400px', // Adjust to fill the root height
                        },
                        '& .MuiDayCalendar-weekDayLabel': {
                            fontSize: '1rem', // Adjust to fill the root height
                        },
                    }}
                    slots={{
                        day: ServerDay,
                    }}
                    slotProps={{
                        day: {
                            highlightedDays,
                            sx: {
                                width: '42px',
                                height: '42px',
                                fontSize: '1rem',
                            },
                        } as any,
                    }}
                />
            </LocalizationProvider>
            <Stack>
                <Button variant="contained" onClick={() => setDate(null)}>
                    Скинути календар
                </Button>
            </Stack>
        </Paper>
    );
}
