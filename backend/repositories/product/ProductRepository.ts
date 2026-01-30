import { ProductRepository } from '@/domain/product/ProductRepository';

import { IndexedDB } from '../db/IndexedDB';

const STORE = 'products';

export class IndexedDBProductRepository implements ProductRepository {
  constructor(private readonly db: IndexedDB) {}

  save(product: ProductSnapshot): Promise<void> {
    return this.db.transaction<void>(STORE, 'readwrite', store =>
      store.put(product)
    );
  }

  getById(id: string): Promise<ProductSnapshot | null> {
    return this.db.transaction<ProductSnapshot | null>(STORE, 'readonly', store =>
      store.get(id)
    );
  }

  getAll(): Promise<ProductSnapshot[]> {
    return this.db.transaction<ProductSnapshot[]>(STORE, 'readonly', store =>
      store.getAll()
    );
  }
}
