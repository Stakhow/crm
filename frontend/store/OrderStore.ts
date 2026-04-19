import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { OrderViewDTO } from '../../dto/OrderViewDTO';
import { orderService } from '../../backend';
import { AppError } from '../../utils/error';
import { notify } from './NotificationStore';
import { Dayjs } from 'dayjs';

interface OrderState {
    isLoading: boolean;
    error: string;
    orders: OrderViewDTO[];
    order: OrderViewDTO;
    monthOrders: Map<number, OrderViewDTO[]>;
    getOrdersByClient: (clientId: number) => void;
    getOrders: (orderId: number) => OrderViewDTO[];
    getOrder: (orderId: number) => OrderViewDTO;
    createOrder: (date: Dayjs) => OrderViewDTO;
    repeatOrder: (orderId: number) => void;
    getOrdersByMonth: (date: Dayjs) => void;
    getOrdersByTargetDate: (date: Dayjs) => void;
}

const name = 'order';
export const orderStore = create<OrderState>()(
    devtools(
        (set, get) => ({
            isLoading: false,
            error: '',
            date: null,
            orders: undefined,
            order: undefined,
            monthOrders: undefined,
            getOrdersByClient: async (clientId) => {
                set({ isLoading: true, orders: undefined, error: '' }, false, `${name}/getOrdersByClient:start`);

                try {
                    const orders = await orderService.getByClient(clientId);

                    set({ isLoading: false, orders });
                } catch (error: unknown) {
                    if (error instanceof AppError)
                        set({ error: error.message }, false, `${name}/getOrdersByClient:errosMessage`);
                    set({ isLoading: false }, false, `${name}/getOrdersByClient:error`);
                    notify.error(`Помилка отримання списку замовлень клієнта: ${get().error}`);
                }
            },
            createOrder: async (date) => {
                set({ isLoading: true, error: '' }, false, `${name}/createOrder:start`);

                try {
                    const order = await orderService.createOrder(date.valueOf());

                    set({ isLoading: false, order }, false, `${name}/createOrder:success`);

                    notify.success('Замовлення успішно створено');
                } catch (error: unknown) {
                    console.log(error);
                    if (error instanceof AppError)
                        set({ error: error.message }, false, `${name}/createOrder:errosMessage`);
                    set({ isLoading: false }, false, `${name}/createOrder:error`);

                    notify.error(`Помилка створення замовлення: ${get().error}`);
                }
            },
            repeatOrder: async (orderId) => {
                set({ isLoading: true, error: '' }, false, `${name}/repeatOrder:start`);

                try {
                    await orderService.repeatOrder(orderId);

                    set({ isLoading: false }, false, `${name}/repeatOrder:success`);
                    notify.success('Створено корзину із замовлення');
                } catch (error: unknown) {
                    if (error instanceof AppError)
                        set({ error: error.message }, false, `${name}/repeatOrder:errosMessage`);
                    set({ isLoading: false }, false, `${name}/repeatOrder:error`);
                    notify.error(`Помилка при повторенні замовлення: ${get().error}`);
                }
            },
            getOrdersByMonth: async (date) => {
                set({ isLoading: true, error: '', monthOrders: undefined }, false, `${name}/getOrdersByMonth:start`);

                try {
                    const monthOrders = await orderService.getOrdersByMonth(date.valueOf());

                    set(
                        { isLoading: false, monthOrders, orders: monthOrders.get(date.date()) },
                        false,
                        `${name}/getOrdersByMonth:success`,
                    );
                } catch (error: unknown) {
                    if (error instanceof AppError)
                        set({ error: error.message }, false, `${name}/getOrdersByMonth:errosMessage`);
                    set({ isLoading: false }, false, `${name}/getOrdersByMonth:error`);
                    notify.error(`Помилка отримання списку замовлень місяця: ${get().error}`);
                }
            },
            getOrdersByTargetDate: async (date) => {
                set({ isLoading: true, error: '' }, false, `${name}/getOrdersByTargetDate:start`);

                try {
                    const orders = await orderService.getAllByTargetDate(date.valueOf());
                    set({ isLoading: false, orders }, false, `${name}/getOrdersByTargetDate:success`);
                } catch (error: unknown) {
                    if (error instanceof AppError)
                        set({ error: error.message }, false, `${name}/getOrdersByTargetDate:errosMessage`);
                    set({ isLoading: false }, false, `${name}/getOrdersByTargetDate:error`);
                    notify.error(`Помилка отримання списку замовлень дня: ${get().error}`);
                }
            },
        }),
        { name, enabled: true },
    ),
);
