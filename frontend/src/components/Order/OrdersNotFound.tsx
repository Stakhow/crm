import { ComponentNotFound } from '../ComponentNotFound';

export const OrdersNotFound = () => (
    <ComponentNotFound title={'Немає замовлень'} buttonText={'Створити замовлення'} link={'/orders/new'} />
);
