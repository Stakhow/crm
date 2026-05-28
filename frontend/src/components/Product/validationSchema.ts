import * as Yup from 'yup';

export const validationSchema = () => {
    const allFields = {
        width: Yup.number().min(30, 'Замалий розмір').max(100, 'Завеликий розмір').required("Поле обов'язкове"),
        length: Yup.number().min(25, 'Замалий розмір').max(200, 'Завеликий розмір').required("Поле обов'язкове"),
        thickness: Yup.number().min(25, 'Замалий розмір').max(100, 'Завеликий розмір').required("Поле обов'язкове"),
        quantity: Yup.number().min(0, 'Вкажіть нуль або більше').required("Поле обов'язкове"),
        price: Yup.number().positive('Введіть число більше нуля').required("Поле обов'язкове"),
        name: Yup.string(),
    };

    return Yup.object({
        categoryName: Yup.string().required(),

        fields: Yup.array().of(
            Yup.object({
                // name: Yup.string().required(),

                // @ts-ignore
                value: Yup.lazy((value, { parent, options }) => {
                    const name = parent.name;
                    const categoryName = options?.context?.categoryName;

                    // @ts-ignore
                    let schema = allFields[name];

                    if (!schema) {
                        return Yup.mixed();
                    }
                    // @ts-ignore
                    schema = schema.transform((val, originalVal) =>
                        originalVal === '' ? undefined : Number(originalVal),
                    );

                    if (name === 'quantity' && categoryName === 'bag') {
                        schema = schema.integer('Тільки ціле число');
                    }

                    return schema;
                }),
            }),
        ),
    });
};
