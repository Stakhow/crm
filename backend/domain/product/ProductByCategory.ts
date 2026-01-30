import { ProductCategory } from './ProductCategory';
import { Film } from './products/Film';
import { Bag } from './products/Bag';
import { Stretch } from './products/Stretch';
import { Granule } from './products/Granule';

export const ProductByCategory = {
  [ProductCategory.Film]: Film,
  [ProductCategory.Bag]: Bag,
  [ProductCategory.Stretch]: Stretch,
  [ProductCategory.Granule]: Granule,
} as const;