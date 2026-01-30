import { BaseProduct } from '../BaseProduct';

export class Bag extends BaseProduct {
  constructor(
    id: number,
    basePrice: number,
    public readonly capacity: number // кг
  ) {
    super(id, basePrice);
  }

  getTotalPrice(): number {
    return this.capacity * this.basePrice;
  }
}


// import Film, { TFilm } from "../film";
// import CategoryManager from "../attributes/category";

// export type TBagConstructor = TFilm & {
//   length: string;
// };

// const filmType = new CategoryManager("filmType", "Тип плівки");
// filmType.add({ id: "0", name: "pocket", title: "Карман" });
// filmType.add({ id: "1", name: "sleeve", title: "Рукав" });

// export default class Bag extends Film {
//   types;
//   length;

//   constructor(params: TBagConstructor) {
//     super(params);

//     this.types = filmType.getAll();
//     this.length = params.length;
    
//   }
// }
