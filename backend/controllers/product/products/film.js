import FilmTypeManager from "../attributes/filmType.js";
import Product from "../product.js";

export default class Film extends Product {
    
    constructor(params) {
        
        if (params.typeId === undefined) {
            params.typeId = params.pockets > 0 ? 0 : 1;
        }
        
        super(params);
        
        this.width = params.width;
        this.pockets = params.pockets > 0 ? params.pockets : 0;
        this.type = new FilmTypeManager().getById(params.typeId);
    }
}
