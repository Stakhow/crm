import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface CalendarState {
    date: Dayjs;
    month: number;
    setDate: (date: Dayjs) => void;
}

const name = 'calendar';
export const calendarStore = create<CalendarState>()(
    devtools(
        (set) => ({
            date: dayjs(),
            modth: null,
            setDate: (date) => {
                set({ date }, false, `${name}/setDate`);
            },
        }),
        { name, enabled: false },
    ),
);
