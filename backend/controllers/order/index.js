import Client from "../client/index.js";

import ProductManager from "../product/productManager.js";

export default class Order {
    constructor({id, clientId, items, totalPrice} = data) {
        
        if ({id, clientId, items, totalPrice}) {
            this.id = id;
    
            this.createdAt =  new Date();
            this.updatedAt =  new Date();
            this.deletedAt =  '';
    
            this.clientId = clientId;
            this.items = items;
    
            this.totalPrice = totalPrice;
        }
    }
}

const order = new Order({
    id: 'orderId_1',
    clientId: '1',
    items: [
        new ProductManager(0,{
            id: '1',
            categoryId: 2,
            unitValue: 1,
            unitId: 0,
            colorId: 2,
            materialId: 2,
            name: "Bag Product",
            price: 777,
        }).create(),
        new ProductManager(3,{
            id: '2',
            unitValue: 2,
            unitId: 1,
            colorId: 0,
            materialId: 0,
            name: "Stretch product",
            price: 300,
        }).create(),
    ],
    totalPrice: 1999,
});

console.log(order);
