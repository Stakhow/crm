import { Film } from "./products/Film";
import { Bag } from "./products/Bag";
import { Stretch } from "./products/Stretch";
import { Granule } from "./products/Granule";


export const ProductByCategory = {
  film: Film,
  bag: Bag,
  stretch: Stretch,
  granule: Granule,
} as const;
