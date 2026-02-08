import { BaseProduct, type BaseProductProps } from "../BaseProduct";

export class Granule extends BaseProduct {
  constructor(props: BaseProductProps) {
    super(props);
  }

  fillData(data: { name: string; weight: number }) {
    this.name = data.name || "";
    this.weight = data.weight || 0;

    return this;
  }
}
