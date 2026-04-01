import { BaseProduct, type BaseProductProps } from "../BaseProduct";

export interface StretchProps extends BaseProductProps {}

export class Stretch extends BaseProduct {
  constructor(props: StretchProps) {
    super(props);
  }
}
