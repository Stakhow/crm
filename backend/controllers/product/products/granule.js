import Product from "../product.js";

export default class Granule extends Product {
    constructor(params) {
        
        params.categoryId = 2;
        
        super(params);
    }
}
