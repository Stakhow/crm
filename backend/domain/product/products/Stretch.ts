import { BaseProduct } from '../BaseProduct';

export class Stretch extends BaseProduct {
  constructor(
    id: number,
    basePrice: number,
    public readonly thickness: number, // мкм
    public readonly weight: number      // кг
  ) {
    super(id, basePrice);
  }

  getTotalPrice(): number {
    const thicknessCoef = this.thickness / 10;
    return this.weight * thicknessCoef * this.basePrice;
  }
}


// import Film from "./film";

// export default class Stretch extends Film {
  
//   constructor(params) {
//     super(params);
//   }
// }
