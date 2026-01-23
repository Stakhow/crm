import Bag from "./products/bag.js";
import Film from "./products/film.js";
import Granule from "./products/granule.js";
import Stretch from "./products/stretch.js";

export const productTypes = [Film, Bag, Granule, Stretch];

// const types = {
//     film: Film,
//     bag: Bag,
//     granule: Granule,
//     stretch: Stretch,
// };

export default class ProductManager {
    
    constructor(productTypeId = 0, productData) {
        
        const product = productTypes[productTypeId];
        
        if (product) this.product = new product(productData);
        else this.product = new productTypes[0](productData);
    }
    
    create () {
        return this.product;
    }
}
