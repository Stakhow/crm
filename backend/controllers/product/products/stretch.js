import Film from "./film.js";

export default class Stretch extends Film {
    constructor(params) {
        
        params.categoryId = 0;
        
        super(params);
    }
}
