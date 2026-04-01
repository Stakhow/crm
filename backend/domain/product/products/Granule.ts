import { BaseProduct, type BaseProductProps } from "../BaseProduct";

export interface GranuleProps extends BaseProductProps {}

export class Granule extends BaseProduct {
  constructor(props: GranuleProps) {
    super(props);
  }
}
