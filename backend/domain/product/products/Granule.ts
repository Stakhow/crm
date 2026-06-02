import type { ProductDataDTO } from "../../../../dto/ProductDataDTO";
import { BaseProduct, type BaseProductProps } from "../BaseProduct";

export interface GranuleProps extends BaseProductProps {}

export class Granule extends BaseProduct<"granule"> {
  readonly categoryName = "granule" as const;
  readonly subCategoryName = undefined;

  constructor(props: GranuleProps) {
    super(props);
  }

  toPersistence(): ProductDataDTO {
    return {
      id: this.id,
      createdAt: this.createdAt,
      updatedAt: Date.now(),
      categoryName: this.categoryName,
      totalAmount: this.totalAmount,
      quantity: this.quantity,
      name: this.name,
      price: this.price,
      unit: this.unit,
    };
  }
}
