import * as Yup from 'yup';

// Matches the exact format: +38 (0XX) XXX-XX-XX
export const ukrainePhoneRegex = /^\+38 \(0\d{2}\) \d{3}-\d{2}-\d{2}$/;

export const validationSchema = Yup.object().shape({
    name: Yup.string().min(2, 'Надто коротке!').max(50, 'Надто довге!').required("Поле обов'язкове"),
    phone: Yup.string().matches(ukrainePhoneRegex, 'Невірний формат номера').required("Поле обов'язкове"),
});


export  const validationSchemaBulk = Yup.object().shape({
    clients: Yup.array().of(validationSchema)
})