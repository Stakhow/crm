import { ComponentNotFound, type ComponentNotFoundProps } from '../ComponentNotFound';

export const OrdersNotFound: React.FC<ComponentNotFoundProps> = ({ ...rest }) => (
    <ComponentNotFound title={'Немає замовлень'} buttonText={'Створити замовлення'} link={'/orders/new'} {...rest} />
);
