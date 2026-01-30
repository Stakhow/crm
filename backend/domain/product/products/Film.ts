import { BaseProduct } from '../BaseProduct';

export class Film extends BaseProduct {
  constructor(
    id: number,
    basePrice: number,
    public readonly width: number,   // см
    public readonly length: number   // м
  ) {
    super(id, basePrice);
  }

  get area(): number {
    return (this.width / 100) * this.length;
  }

  getTotalPrice(): number {
    return this.area * this.basePrice;
  }
}

// import Product, { TProduct } from "./product";
// import CategoryManager from "./attributes/category";

// export type TFilm = TProduct & {
//   width: string;
// };

// const filmType = new CategoryManager("filmType", "Тип плівки");
// filmType.add({ id: "0", name: "pocket", title: "Карман" });
// filmType.add({ id: "1", name: "sleeve", title: "Рукав" });
// filmType.add({ id: "2", name: "halfSleeve", title: "Напіврукав" });
// filmType.add({ id: "3", name: "Canvas", title: "Полотно" });

// export default class Film extends Product {
//   types;
//   width;

//   constructor(params: TFilm) {
//     super(params);

//     this.types = filmType.getAll();
//     this.width = params.width;
//   }
// }
