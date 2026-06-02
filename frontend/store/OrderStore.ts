import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { OrderViewDTO } from '../../dto/OrderViewDTO';
import { orderService } from '../../backend';
import { AppError } from '../../utils/error';
import { notify } from './NotificationStore';
import { Dayjs } from 'dayjs';
import type { OrderStatus } from '../../backend/domain/order/Order';
import type { CartDTO } from '../../dto/CartDTO';
import { Category } from '../../backend/domain/product/ProductCategory';
import type { OrderItemProp } from '../../backend/domain/order/OrderItem';

export type OrderItemView = Omit<OrderItemProp, 'category'> & {
    category: string;
};
export type OrderViewUI = Omit<OrderViewDTO, 'items'> & {
    items: OrderItemView[];
};

interface OrderState {
    isLoading: boolean;
    error: string;
    orders: OrderViewUI[];

    dueDate: Dayjs;
    setDueDate: (date: Dayjs) => void;

    order: OrderViewUI;
    monthOrders: Map<number, OrderViewUI[]>;
    amountPaid: number;
    getOrdersByClient: (clientId: string) => void;
    getOrders: (orderId: string) => OrderViewUI[];
    getOrder: (orderId: string) => OrderViewUI;
    createOrder: (cartId: string, clientId: string) => OrderViewUI;
    getOrdersByMonth: (date: Dayjs) => void;
    getOrdersByTargetDate: (date: Dayjs) => void;
    updateStatus: (orderId: string, status: OrderStatus) => void;
    setAmountPaid: (value: number) => number;
    updateAmountPaid: () => OrderViewUI;
    repeatOrder: (orderId: string) => CartDTO;
}

const name = 'order';
export const orderStore = create<OrderState>()(
    devtools(
        (set, get) => ({
            isLoading: false,
            error: '',
            dueDate: null,
            orders: undefined,
            order: undefined,
            monthOrders: undefined,
            amountPaid: 0,

            setDueDate: (date: Dayjs) => set({ dueDate: date }),

            getOrdersByClient: async (clientId) => {
                set({ isLoading: true, orders: undefined, error: '' }, false, `${name}/getOrdersByClient:start`);

                try {
                    const orders = await orderService.getByClient(clientId);

                    set({ isLoading: false, orders: orders.map((order) => orderMap(order)) });
                } catch (error: unknown) {
                    if (error instanceof AppError)
                        set({ error: error.message }, false, `${name}/getOrdersByClient:errosMessage`);
                    set({ isLoading: false }, false, `${name}/getOrdersByClient:error`);
                    notify.error(`Помилка отримання списку замовлень клієнта: ${get().error}`);
                }
            },
            createOrder: async (cartId, clientId) => {
                set({ order: undefined, isLoading: true, error: '' }, false, `${name}/createOrder:start`);

                try {
                    const order = await orderService.createOrder(
                        cartId,
                        get().dueDate.valueOf(),
                        get().amountPaid,
                        clientId,
                    );

                    set({ isLoading: false, order }, false, `${name}/createOrder:success`);

                    notify.success('Замовлення успішно створено');

                    localStorage.removeItem('cartId');

                    return order;
                } catch (error: unknown) {
                    console.log(error);
                    if (error instanceof AppError)
                        set({ error: error.message }, false, `${name}/createOrder:errosMessage`);
                    set({ isLoading: false }, false, `${name}/createOrder:error`);

                    notify.error(`Помилка створення замовлення: ${get().error}`);
                }
            },

            getOrdersByMonth: async (date) => {
                set({ isLoading: true, error: '', monthOrders: undefined }, false, `${name}/getOrdersByMonth:start`);

                try {
                    const monthOrders = await orderService.getOrdersByMonth(date.valueOf());
                    const orders = monthOrders.get(date.date());

                    if (!orders) return;

                    set(
                        { isLoading: false, monthOrders, orders: orders.map((order) => orderMap(order)) },
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
                    set(
                        { isLoading: false, orders: orders.map((order) => orderMap(order)) },
                        false,
                        `${name}/getOrdersByTargetDate:success`,
                    );
                } catch (error: unknown) {
                    if (error instanceof AppError)
                        set({ error: error.message }, false, `${name}/getOrdersByTargetDate:errosMessage`);
                    set({ isLoading: false }, false, `${name}/getOrdersByTargetDate:error`);
                    notify.error(`Помилка отримання списку замовлень дня: ${get().error}`);
                }
            },
            getOrder: async (orderId) => {
                set({ order: undefined, isLoading: true, error: '' }, false, `${name}/getOrder:start`);

                try {
                    const orderRow = await orderService.getById(orderId);
                    const order = orderMap(orderRow);

                    set({ isLoading: false, order, amountPaid: order.amountPaid }, false, `${name}/getOrder:success`);

                    return order;
                } catch (error: unknown) {
                    console.log(error);
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
                    const order = await orderService.updateAmountPaid(get().order.id, get().amountPaid);

                    set({ isLoading: false, order: orderMap(order) }, false, `${name}/updateAmountPaid:success`);

                    notify.success('Суму оплати оновлено');

                    return order;
                } catch (error: unknown) {
                    if (error instanceof AppError)
                        set({ error: error.message }, false, `${name}/updateAmountPaid:errosMessage`);
                    set({ isLoading: false }, false, `${name}/updateAmountPaid:error`);
                    notify.error(`Помилка оновлення суми оплати: ${get().error}`);
                }
            },

            repeatOrder: async (orderId) => {
                set({ isLoading: true, error: '' }, false, `${name}/repeatOrder:start`);

                try {
                    const cart = await orderService.repeatOrder(orderId);

                    set({ isLoading: false }, false, `${name}/repeatOrder:success`);

                    notify.success('Створено корзину із замовлення');

                    return cart;
                } catch (error: unknown) {
                    console.log(error);
                    if (error instanceof AppError)
                        set({ error: error.message }, false, `${name}/repeatOrder:errosMessage`);
                    set({ isLoading: false }, false, `${name}/repeatOrder:error`);
                    notify.error(`Помилка при повторенні замовлення: ${get().error}`);
                }
            },
        }),
        { name, enabled: true },
    ),
);

function orderMap(order: OrderViewDTO) {
    const items = order.items.map((i) => ({
        ...i,
        category: new Category().getTitle(i.category) as string,
    }));
    return { ...order, items };
}
