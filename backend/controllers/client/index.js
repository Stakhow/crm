import ClientModel from "../../models/clientModel.js";

const clientModel = new ClientModel();

export default class Client {
    async create({name, phone}) {
        return await clientModel.add({name, phone});
    }
    
    async get(clientId) {
        return await clientModel.get(clientId);
    }
    
    async getAll() {
        return await clientModel.getAll();
    }
    
    async delete(clientId) {
        return await clientModel.delete(clientId);
    }
    
    async getByIndex(index, data) {
        return await clientModel.getByIndex(index, data);
    }
    
}
