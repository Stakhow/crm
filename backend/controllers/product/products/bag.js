import Film from "./film.js";

export default class Bag extends Film {
    constructor(params) {
        
        params.unitId = params.unitId !== undefined ? params.unitId : 1;
        params.categoryId = 1;
        
        super(params);
        
        this.width = params.width;
        this.length = params.length;
    }
}
