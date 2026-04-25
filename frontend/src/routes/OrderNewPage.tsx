import { Formik, Form } from 'formik';
import { CircularProgress, Stack, Box, Backdrop } from '@mui/material';
import { CategoryWithState } from '../components/Categories';
import type { ProductCategory } from '../../../backend/domain/product/ProductCategory';
import * as Yup from 'yup';
import { cartStore, categoryStore, clientStore, productStore } from '../../store';
import { BottomBar } from '../components/BottomBar';
import { OrderTotalAmount } from '../components/Order/OrderTotalAmount';
import { ClientsListSelect } from '../components/Client/ClientsListSelect';
// import { CartList } from '../components/Cart/CartList';
import { GoToCartButton } from '../components/Cart/CartButtons';
import { CartProductListSelect } from '../components/Cart/CartProductsList';

export interface OrderFormValues {
    client: number;
    totalAmount: number;
    categoryName: ProductCategory;
    id: number;
    quantity: number;
    stock: number;
}

export default function OrderPageNew() {
    const { cart, isLoading } = cartStore((s) => s);
    const { clientId } = clientStore((s) => s);
    const { categoryName } = categoryStore((s) => s);
    const { product } = productStore((s) => s);

    const initialValues: OrderFormValues = {
        client: !!cart ? cart.clientId : clientId,
        totalAmount: cart?.totalAmount ?? 0,
        categoryName: categoryName,
        id: product?.id ?? 0,
        stock: product?.quantity ?? 0,
        quantity: 0,
    };
    const validationSchema = Yup.object().shape({
        client: Yup.string().required("Поле обов'язкове"),
        totalAmount: Yup.number().moreThan(0, 'Позитивне значення').required("Поле обов'язкове"),
        categoryName: Yup.string().required("Поле обов'язкове"),
        id: Yup.number().required("Поле обов'язкове"),
        stock: Yup.number(),
        quantity: Yup.number()
            .max(Yup.ref('stock'), 'Продукту не вистачає на складі')
            .positive('Тільки позитивне число')
            .when('categoryName', {
                is: 'bag',
                then: (schema) => schema.integer('Тільки ціле число').required("Поле обов'язкове"),
                otherwise: (schema) => schema.required("Поле обов'язкове"),
            }),
    });

    return (
        <Box>
            <Formik
                initialValues={initialValues}
                validateOnBlur={false}
                onSubmit={() => {}}
                validationSchema={validationSchema}
                enableReinitialize={true}
            >
                {({ values }) => {
                    return (
                        <Form>
                            <Stack mb={14} spacing={2}>
                                <ClientsListSelect />

                                {/* <CartList /> */}

                                <CategoryWithState />
                                <CartProductListSelect />

                                <BottomBar>
                                    <OrderTotalAmount totalAmount={values.totalAmount} />

                                    <GoToCartButton disabled={values.totalAmount === 0} />
                                </BottomBar>
                            </Stack>
                        </Form>
                    );
                }}
            </Formik>

            <Backdrop sx={(theme: any) => ({ color: '#fff', zIndex: theme.zIndex.drawer + 1 })} open={isLoading}>
                <CircularProgress color="inherit" />
            </Backdrop>
        </Box>
    );
}
