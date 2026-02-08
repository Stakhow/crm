import { BaseProduct, type BaseProductProps } from "../BaseProduct";

export interface FilmProps extends BaseProductProps {}

export class Film extends BaseProduct {
  private width: number;
  private thickness: number;

  constructor(props: FilmProps) {
    super(props);
    this.category = props.category;
    this.width = 0;
    this.thickness = 0;
  }

  set setWidth(v: number) {
    this.width = v;
  }

  set setThickness(v: number) {
    this.thickness = v;
  }

  fillData(data: {
    name: string;
    width: number;
    weight: number;
    thickness: number;
  }) {
    this.name = data.name;
    this.width = data.width;
    this.weight = data.weight;
    this.thickness = data.thickness;
    console.log("fillData", data);

    return this;
  }
}
