import type { ProductByCategory } from "./ProductByCategory";

export type ProductCategory = keyof typeof ProductByCategory;

export class Category {
  constructor() {}

  public getAll() {
    const categories: ProductCategory[] = ["film", "bag", "stretch", "granule"];

    return categories.map((categoryName) => ({
      name: categoryName,
      title: this.getTitle(categoryName),
    }));
  }
  public getTitle(categoryName: ProductCategory) {
    let title = "";
    switch (categoryName) {
      case "film":
        title = "Плівка";
        break;
      case "bag":
        title = "Пакет";
        break;
      case "stretch":
        title = "Стрейч";
        break;
      case "granule":
        title = "Гранула";
        break;
    }

    return title;
  }
}
