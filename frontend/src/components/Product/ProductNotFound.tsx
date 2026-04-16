import { ComponentNotFound } from '../ComponentNotFound';

export const ProductNotFound = () => (
    <ComponentNotFound title={'Продукт не знайдено '} buttonText={'Додати продукт'} link={'/products/new'} />
);
