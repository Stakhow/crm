import {
  ProductCtorArgs,
  ProductManager,
} from "../domain/product/ProductManager";
import type { ProductDTO } from "./../../dto/ProductDTO";
import { ProductModifier } from "../domain/product/modifiers/ProductModifier";
import { ProductCategory } from "./../domain/product/ProductCategory";
import type { ProductByCategory } from "../domain/product/ProductByCategory";
import { AppError } from "../utils/error";
import type { ProductRepository } from "../../dto/ProductRepository";

const modifiers = () =>
  [
    new ProductModifier(
      "1",
      "material",
      "Матеріал",
      [ProductCategory.Film, ProductCategory.Bag],
      [
        { id: "1", name: "secondary", price: 72, title: "Вторинна гранула" },
        { id: "2", name: "primary", price: 110, title: "Первинна гранула" },
      ],
    ),
    new ProductModifier(
      "2",
      "color",
      "Колір",
      [ProductCategory.Film, ProductCategory.Bag],
      [
        { id: "1", name: "transparent", price: 0, title: "Прозорий" },
        { id: "2", name: "colored", price: 2, title: "Кольоровий" },
      ],
    ),
    new ProductModifier(
      "3",
      "filmType",
      "Тип Плівки",
      [ProductCategory.Film],
      [
        { id: "1", name: "pocket", price: 0, title: "Карман" },
        { id: "2", name: "sleeve", price: 0, title: "Рукав" },
        { id: "3", name: "halfSleeve", price: 0, title: "Напіврукав" },
        { id: "4", name: "canvas", price: 0, title: "Полотно" },
      ],
    ),
    new ProductModifier(
      "4",
      "bagFilmType",
      "Тип Плівки",
      [ProductCategory.Bag],
      [
        { id: "1", name: "pocket", price: 0, title: "Карман" },
        { id: "2", name: "sleeve", price: 0, title: "Рукав" },
      ],
    ),
    new ProductModifier(
      "5",
      "materialStretch",
      "Матеріал Стрейчу",
      [ProductCategory.Stretch],
      [
        { id: "1", name: "secondary", price: 100, title: "Чорний" },
        { id: "2", name: "primary", price: 200, title: "Сірий" },
        { id: "3", name: "primary", price: 200, title: "Прозорий" },
      ],
    ),
    new ProductModifier(
      "6",
      "bagType",
      "Тип Пакета",
      [ProductCategory.Bag],
      [
        { id: "1", name: "bag", price: 0, title: "Мішок" },
        { id: "2", name: "handle", price: 0, title: "Ручка" },
        { id: "3", name: "t-shirt", price: 0, title: "Майка" },
      ],
    ),
    new ProductModifier(
      "7",
      "materialGranule",
      "Матеріал Гранули",
      [ProductCategory.Granule],
      [
        { id: "1", name: "secondary", price: 72, title: "Вторинна гранула" },
        { id: "2", name: "primary", price: 110, title: "Первинна гранула" },
      ],
    ),
  ] as const;

export class ProductService {
  private product: InstanceType<(typeof ProductByCategory)[ProductCategory]>;

  constructor(
    private productManager: ProductManager,
    private productRepository: ProductRepository,
  ) {
    this.productManager = productManager;
    this.productRepository = productRepository;
  }

  get modifiers() {
    return modifiers();
  }

  create(props: ProductDTO) {
    const category = props.category;

    return new Promise((resolve, reject) => {
      this.product = this.productManager.createByCategory(category, [props]);

      console.log("create", this.product);

      if (this.product) {
        const initialValues: {
          [key: string]: string | number;
        } = {};

        const fields = this.getFieldsForCreate(category);
        fields.map((i) => (initialValues[i.name] = ""));

        const modifiers: ProductModifier[] = this.modifiers.filter((i) =>
          i.category.includes(category),
        );
        modifiers.map((m) => (initialValues[m.name] = m.list[0].id));

        resolve(
          JSON.parse(
            JSON.stringify({
              ...this.product,
              modifiers,
              fields,
              initialValues,
            }),
          ),
        );
      } else reject(new AppError("SERVICE", "Помилка при створенні об'єкта"));
    });
  }

  save(values): Promise<void> {
    const p = this.product;

    this.product.fillData(values);

    return this.productRepository.save(p);
  }

  getAll() {
    return this.productRepository.getAll();
  }

  delete(id: string) {
    return this.productRepository.delete(id);
  }

  getClassByCategory(c) {
    return this.productManager.getClassByCategory(c);
  }

  fillDataService(values) {
    return this.product.fillData(values);
  }

  calulate(values) {
    console.log("calculate:", this.product);
    const mods = this.modifiers
      .filter((m) => values.hasOwnProperty(m.name))
      .map((fm) => {
        fm.list = fm.list.filter((l) => l.id === values[fm.name]);

        return fm;
      });
    console.log("mods", mods);
    this.product.setModifiers = mods;

    this.product.fillData(values);

    const res = this.product.getTotalPrice();

    return res;
  }

  getWeight() {
    return this.product.getWeight();
  }

  getByIndex(a: string, b: string) {
    return this.productRepository.getByIndex(a, b);
  }
  getByCategory(category: string) {
    return this.productRepository.getByCategory(category);
  }

  getFieldsForCreate(category: string): Array<{
    name: string;
    title: string;
    fieldType: string;
    required?: boolean;
  }> {
    const key: string = category;

    const addionalFields = {
      film: [
        {
          name: "width",
          title: "Ширина (см)",
          fieldType: "number",
          required: true,
        },
        {
          name: "thickness",
          title: "Товщина (мкм)",
          fieldType: "number",
          required: true,
        },
      ],
      bag: [
        {
          name: "width",
          title: "Ширина (см)",
          fieldType: "number",
          required: true,
        },
        {
          name: "length",
          title: "Довжина (см)",
          fieldType: "number",
          required: true,
        },
        {
          name: "thickness",
          title: "Товщина (мкм)",
          fieldType: "number",
          required: true,
        },
        {
          name: "quantity",
          title: "Кількість (шт.)",
          fieldType: "number",
          required: true,
        },
      ],
      stretch: [],
      granule: [],
    };

    return [
      ...(category && addionalFields[category]),
      { name: "weight", title: "Вага (кг)", fieldType: "number" },
      { name: "name", title: "Назва продукту", fieldType: "text" },
    ];
  }

  getCategories(): Promise<{ name: string; title: string }[]> {
    return new Promise((resolve, reject) => {
      resolve(
        Object.values(ProductCategory).map((category) => {
          let title = "";
          switch (category) {
            case ProductCategory.Film:
              title = "Плівка";
              break;
            case ProductCategory.Bag:
              title = "Пакет";
              break;
            case ProductCategory.Stretch:
              title = "Стрейч";
              break;
            case ProductCategory.Granule:
              title = "Гранула";
              break;
          }
          return { name: category, title };
        }),
      );
    });
  }

  getProductsJSON(category: string): Promise<object[]> {
    return new Promise(async (resolve, reject) => {
      try {
        const fields = await this.getFieldsForCreate(category);
        const categories = await this.getCategories();
        const products = await this.getByCategory(category);

        products.map((product) => {
          product.fields = fields
            .filter((i) => product.hasOwnProperty(i.name))
            .filter((i) => i.name !== "name")
            .map((i) => ({
              name: i.name,
              title: i.title,
              value: product[i.name],
            }));
        });

        resolve(products);
      } catch (error) {
        reject(error);
      }
    });
  }
}
