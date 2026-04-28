import * as Yup from 'yup';
const variant = Yup.object().shape({
    name: Yup.string().required("Поле обов'язкове"),
    price: Yup.number().min(0, 'Не менше ніж нуль'),
});

export const validationSchema = Yup.object().shape({
    categories: Yup.array().min(1, "Поле обов'язкове").required("Поле обов'язкове"),
    name: Yup.string().required("Поле обов'язкове"),
    list: Yup.array().of(variant).min(1, 'Мінімум один варіант').required("Поле обов'язкове"),
});
