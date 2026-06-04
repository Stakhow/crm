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
import type { OrderQuery } from '../../dto/OrderQuery';

export type OrderItemView = Omit<OrderItemProp, 'category'> & { category: string };
export type OrderViewUI = Omit<OrderViewDTO, 'items' | 'statuses'> & {
    items: OrderItemView[];
    statusTitle: string;
    statuses: { title: string; value: string }[];
};

interface OrderState {
    isLoading: boolean;
    error: string;
    orders: OrderViewUI[];
    dueDate: Dayjs | null;
    order: OrderViewUI;
    statuses: OrderViewUI['statuses'];
    monthOrders: Map<number, OrderViewUI[]> | null;
    amountPaid: number;
    setDueDate: (date: Dayjs) => void;
    getOrders: (query?: OrderQuery) => OrderViewUI[];
    getOrdersByClient: (clientId: string) => OrderViewUI[];
    createOrder: (cartId: string, clientId: string) => OrderViewUI;
    getOrdersByMonth: (date: Dayjs) => void;
    getOrdersByTargetDate: (date: Dayjs) => OrderViewUI[];
    getOrder: (orderId: string) => OrderViewUI;
    updateStatus: (orderId: string, status: OrderStatus) => OrderStatus;
    setAmountPaid: (value: number) => void;
    updateAmountPaid: () => OrderViewUI;
    repeatOrder: (orderId: string) => CartDTO;
}

const name = 'order';
const categoryInstance = new Category();

const STATUS_TITLES = {
    all: 'Усі',
    InProgress: 'В роботі',
    Done: 'Виконано',
    Cancelled: 'Відмінений',
} as const;

export const orderStore = create<OrderState>()(
    devtools(
        (set, get) => {
            const handleRequest = async <T>(
                actionName: string,
                errorMessage: string,
                requestFn: () => Promise<T>,
                onStartInit: Partial<OrderState> = { isLoading: true, error: '' },
            ): Promise<T | undefined> => {
                set(onStartInit, false, `${name}/${actionName}:start`);
                try {
                    const result = await requestFn();
                    set({ isLoading: false }, false, `${name}/${actionName}:success`);
                    return result;
                } catch (error: unknown) {
                    const msg = error instanceof AppError ? error.message : 'Невідома помилка';
                    set({ error: msg, isLoading: false }, false, `${name}/${actionName}:error`);
                    notify.error(`${errorMessage}: ${msg}`);
                    return undefined;
                }
            };

            return {
                isLoading: false,
                error: '',
                dueDate: null,
                orders: [],
                order: null,
                monthOrders: null,
                amountPaid: 0,
                statuses: statusMap(['all', 'InProgress', 'Done', 'Cancelled']),

                setDueDate: (date) => set({ dueDate: date }),
                setAmountPaid: (value) => set({ amountPaid: value }),

                getOrders: (query) =>
                    handleRequest(
                        'getOrders',
                        'Помилка отримання списку замовлень',
                        async () => {
                            const res = await orderService.getAll(query);
                            set({ orders: res.map(orderMap) });
                        },
                        { isLoading: true, orders: [], error: '' },
                    ),

                getOrdersByClient: (clientId) =>
                    handleRequest(
                        'getOrdersByClient',
                        'Помилка отримання списку замовлень клієнта',
                        async () => {
                            const res = await orderService.getByClient(clientId);
                            set({ orders: res.map(orderMap) });
                        },
                        { isLoading: true, orders: [], error: '' },
                    ),

                createOrder: async (cartId, clientId) =>
                    await handleRequest(
                        'createOrder',
                        'Помилка створення замовлення',
                        async () => {
                            const res = await orderService.createOrder(
                                cartId,
                                get().dueDate?.valueOf() || 0,
                                get().amountPaid,
                                clientId,
                            );
                            const order = orderMap(res);
                            set({ order });
                            notify.success('Замовлення успішно створено');
                            localStorage.removeItem('cartId');
                            return order;
                        },
                        { order: undefined, isLoading: true, error: '' },
                    ),

                getOrdersByMonth: (date) =>
                    handleRequest(
                        'getOrdersByMonth',
                        'Помилка отримання списку замовлень місяця',
                        async () => {
                            const raw = await orderService.getOrdersByMonth(date.valueOf());
                            const monthOrders = new Map<number, OrderViewUI[]>(
                                Array.from(raw.entries()).map(([day, list]) => [day, list.map(orderMap)]),
                            );
                            set({ monthOrders, orders: monthOrders.get(date.date()) || [] });
                        },
                        { isLoading: true, error: '', monthOrders: null, orders: [] },
                    ),

                getOrdersByTargetDate: (date) =>
                    handleRequest(
                        'getOrdersByTargetDate',
                        'Помилка отримання списку замовлень дня',
                        async () => {
                            const res = await orderService.getAllByTargetDate(date.valueOf());
                            const orders = res.map(orderMap);
                            set({ orders });

                            return orders;
                        },
                        { orders: [], isLoading: true, error: '' },
                    ),

                getOrder: (orderId) =>
                    handleRequest(
                        'getOrder',
                        'Помилка отримання замовлення',
                        async () => {
                            const res = await orderService.getById(orderId);
                            const order = orderMap(res);
                            set({ order, amountPaid: order.amountPaid });
                            return order;
                        },
                        { order: undefined, isLoading: true, error: '' },
                    ),

                updateStatus: (orderId, status) =>
                    handleRequest(
                        'updateStatus',
                        'Помилка оновлення статусу',
                        async () => {
                            const oldStatus = get().order.status;
                            await orderService.updateStatus(orderId, status);

                            const message: Record<OrderStatus, string> = {
                                InProgress: 'Замовлення в роботі',
                                Done: 'Замовлення виконано. Товари списано зі складу',
                                Cancelled: `Замовлення відмінено. ${oldStatus === 'Done' ? 'Товари повернуто на склад' : ''}`,
                            };

                            notify.success(message[status]);

                            return status;
                        },
                        { error: '' },
                    ),

                updateAmountPaid: () =>
                    handleRequest(
                        'updateAmountPaid',
                        'Помилка оновлення суми оплати',
                        async () => {
                            const res = await orderService.updateAmountPaid(get().order!.id, get().amountPaid);
                            const order = orderMap(res);
                            set({ order });
                            notify.success('Суму оплати оновлено');
                            return order;
                        },
                        { error: '', isLoading: true },
                    ),

                repeatOrder: (orderId) =>
                    handleRequest('repeatOrder', 'Помилка при повторенні замовлення', async () => {
                        const cart = await orderService.repeatOrder(orderId);
                        notify.success('Створено корзину із замовлення');
                        return cart;
                    }),
            };
        },
        { name, enabled: true },
    ),
);

function statusMap(statuses: ('all' | OrderStatus)[]) {
    return statuses.map((s) => ({ value: s, title: STATUS_TITLES[s] || s }));
}

function orderMap(order: OrderViewDTO): OrderViewUI {
    const items = order.items.map((i) => ({
        ...i,
        category: categoryInstance.getTitle(i.category) as string,
    }));

    const statuses = statusMap(order.statuses);
    const statusTitle = STATUS_TITLES[order.status] || '';

    return { ...order, items, statuses, statusTitle };
}
