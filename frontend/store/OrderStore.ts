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
    monthOrders: Map<number, OrderViewUI[]> | null;
    amountPaid: number;
    setDueDate: (date: Dayjs) => void;
    getOrders: () => Promise<void>;
    getOrdersByClient: (clientId: string) => Promise<void>;
    createOrder: (cartId: string, clientId: string) => Promise<any>;
    getOrdersByMonth: (date: Dayjs) => Promise<void>;
    getOrdersByTargetDate: (date: Dayjs) => Promise<void>;
    getOrder: (orderId: string) => Promise<OrderViewUI | undefined>;
    updateStatus: (orderId: string, status: OrderStatus) => Promise<void>;
    setAmountPaid: (value: number) => void;
    updateAmountPaid: () => Promise<any>;
    repeatOrder: (orderId: string) => Promise<CartDTO | undefined>;
}

const name = 'order';
const categoryInstance = new Category();

const STATUS_TITLES = {
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

                setDueDate: (date) => set({ dueDate: date }),
                setAmountPaid: (value) => set({ amountPaid: value }),

                getOrders: () =>
                    handleRequest(
                        'getOrders',
                        'Помилка отримання списку замовлень',
                        async () => {
                            const res = await orderService.getAll();
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

                createOrder: (cartId, clientId) =>
                    handleRequest(
                        'createOrder',
                        'Помилка створення замовлення',
                        async () => {
                            const res = await orderService.createOrder(
                                cartId,
                                get().dueDate?.valueOf() || 0,
                                get().amountPaid,
                                clientId,
                            );
                            set({ order: orderMap(res) });
                            notify.success('Замовлення успішно створено');
                            localStorage.removeItem('cartId');
                            return res;
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
                            set({ orders: res.map(orderMap) });
                        },
                        { orders: [], isLoading: true, error: '' },
                    ),

                getOrder: (orderId) =>
                    handleRequest(
                        'getOrder',
                        'Помилка отримання замовлення',
                        async () => {
                            const res = await orderService.getById(orderId);
                            const OrderUI = orderMap(res);
                            set({ order: OrderUI, amountPaid: OrderUI.amountPaid });
                            return OrderUI;
                        },
                        { order: undefined, isLoading: true, error: '' },
                    ),

                updateStatus: (orderId, status) =>
                    handleRequest(
                        'updateStatus',
                        'Помилка оновлення статусу',
                        async () => {
                            await orderService.updateStatus(orderId, status);
                            notify.success('Статус оновлено');
                        },
                        { error: '' },
                    ),

                updateAmountPaid: () =>
                    handleRequest(
                        'updateAmountPaid',
                        'Помилка оновлення суми оплати',
                        async () => {
                            const res = await orderService.updateAmountPaid(get().order!.id, get().amountPaid);
                            set({ order: orderMap(res) });
                            notify.success('Суму оплати оновлено');
                            return res;
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

function orderMap(order: OrderViewDTO): OrderViewUI {
    const items = order.items.map((i) => ({
        ...i,
        category: categoryInstance.getTitle(i.category) as string,
    }));

    const statuses = order.statuses.map((s) => ({ value: s, title: STATUS_TITLES[s] || s }));
    const statusTitle = STATUS_TITLES[order.status] || '';

    return { ...order, items, statuses, statusTitle };
}
