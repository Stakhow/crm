import { BaseProduct, type BaseProductProps } from "../BaseProduct";

export class Stretch extends BaseProduct {
  constructor(props: BaseProductProps) {
    super(props);
  }

  fillData(data: {}): ThisType<Stretch> {
    this.name = data.name;
    this.weight = data.weight;

    return this;
  }
}
