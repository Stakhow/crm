import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { OrderViewDTO } from '../../dto/OrderViewDTO';
import { orderService } from '../../backend';
import { AppError } from '../../utils/error';
import { notify } from './NotificationStore';
import { Dayjs } from 'dayjs';
import type { OrderStatus } from '../../backend/domain/order/Order';
import type { CartDTO } from '../../dto/CartDTO';

interface OrderState {
    isLoading: boolean;
    error: string;
    orders: OrderViewDTO[];
    order: OrderViewDTO;
    monthOrders: Map<number, OrderViewDTO[]>;
    amountPaid: number;
    getOrdersByClient: (clientId: number) => void;
    getOrders: (orderId: number) => OrderViewDTO[];
    getOrder: (orderId: number) => OrderViewDTO;
    createOrder: (date: Dayjs) => OrderViewDTO;
    repeatOrder: (orderId: number) => CartDTO;
    getOrdersByMonth: (date: Dayjs) => void;
    getOrdersByTargetDate: (date: Dayjs) => void;
    updateStatus: (orderId: number, status: OrderStatus) => void;
    setAmountPaid: (value: number) => number;
    updateAmountPaid: () => OrderViewDTO;
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
            amountPaid: 0,

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
                    const order = await orderService.createOrder(date.valueOf(), get().amountPaid);

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
                    const cart = await orderService.repeatOrder(orderId);

                    set({ isLoading: false, order: undefined }, false, `${name}/repeatOrder:success`);
                    notify.success('Створено корзину із замовлення');

                    return cart;
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
            getOrder: async (orderId) => {
                set({ isLoading: true, error: '' }, false, `${name}/getOrder:start`);

                try {
                    const order = await orderService.getById(orderId);
                    set({ isLoading: false, order, amountPaid: order.amountPaid }, false, `${name}/getOrder:success`);

                    return order;
                } catch (error: unknown) {
                    if (error instanceof AppError)
                        set({ error: error.message }, false, `${name}/getOrder:errosMessage`);
                    set({ isLoading: false }, false, `${name}/getOrder:error`);
                    notify.error(`Помилка отримання замовлення: ${get().error}`);
                }
            },
            updateStatus: async (orderId, status) => {
                set({ error: '' }, false, `${name}/updateStatus:start`);

                try {
                    await orderService.updateStatus(orderId, status);

                    set({ isLoading: false }, false, `${name}/updateStatus:success`);

                    notify.success('Статус оновлено');
                } catch (error: unknown) {
                    if (error instanceof AppError)
                        set({ error: error.message }, false, `${name}/updateStatus:errosMessage`);
                    set({ isLoading: false }, false, `${name}/updateStatus:error`);
                    notify.error(`Помилка оновлення статусу: ${get().error}`);
                }
            },
            setAmountPaid: (value) => set({ amountPaid: value }),

            updateAmountPaid: async () => {
                set({ error: '', isLoading: true }, false, `${name}/updateAmountPaid:init`);

                try {
                    console.log('updateAmountPaid', get().order.id, get().amountPaid);
                    const order = await orderService.updateAmountPaid(get().order.id, get().amountPaid);

                    set({ isLoading: false, order }, false, `${name}/updateAmountPaid:success`);

                    notify.success('Суму оплати оновлено');

                    return order;
                } catch (error: unknown) {
                    if (error instanceof AppError)
                        set({ error: error.message }, false, `${name}/updateAmountPaid:errosMessage`);
                    set({ isLoading: false }, false, `${name}/updateAmountPaid:error`);
                    notify.error(`Помилка оновлення суми оплати: ${get().error}`);
                }
            },
        }),
        { name, enabled: true },
    ),
);
