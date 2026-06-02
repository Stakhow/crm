import * as Yup from 'yup';

export const validationSchema = Yup.object().shape({
    totalAmount: Yup.number().moreThan(0, 'Позитивне значення').required("Поле обов'язкове"),
    categoryName: Yup.string().required("Поле обов'язкове"),
    id: Yup.number().required("Поле обов'язкове"),
    // stock: Yup.number(),
    quantity: Yup.number()
        // .max(Yup.ref('stock'), 'Продукту не вистачає на складі')
        .positive('Тільки позитивне число')
        .when('categoryName', {
            is: 'bag',
            then: (schema) => schema.integer('Тільки ціле число').required("Поле обов'язкове"),
            otherwise: (schema) => schema.required("Поле обов'язкове"),
        }),
});
