import { BaseProduct } from '../BaseProduct';

export class Granule extends BaseProduct {
  constructor(
    id: number,
    basePrice: number,
    public readonly weight: number // кг
  ) {
    super(id, basePrice);
  }

  getTotalPrice(): number {
    return this.weight * this.basePrice;
  }
}


// import Product from "../product";

// export default class Granule extends Product {
  
//   constructor(params) {
//     super(params);
//   }
// }
