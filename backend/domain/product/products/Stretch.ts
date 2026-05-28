import type {
  ProductDataDTO,
} from "../../../../dto/ProductDataDTO";
import { BaseProduct, type BaseProductProps } from "../BaseProduct";

export interface StretchProps extends BaseProductProps {}

export class Stretch extends BaseProduct<"stretch"> {
  readonly categoryName = "stretch" as const;

  constructor(props: StretchProps) {
    super(props);
  }

  toPersistence(): ProductDataDTO {
    return {
      id: this.id,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      categoryName: this.categoryName,
      totalAmount: this.totalAmount,
      quantity: this.quantity,
      name: this.name,
      price: this.price,
    };
  }
}
