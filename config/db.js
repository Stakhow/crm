export class IndexedDBManager {
    constructor(dbName, version) {
        this.dbName = dbName;
        this.version = version;
        this.db = null;
        // this.storeName = 'clients';
    }
    
    // Opens the connection and handles upgrades
    async connect() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version);
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                console.log('request.onupgradeneeded', event);
                
                if(!db.objectStoreNames.contains('clients')) {
                    db.createObjectStore('clients', { keyPath: 'id', autoIncrement: true });
    
                    // store.createIndex('phoneIndex', 'phone', { unique: false });
                }
    
                // if(!db.objectStoreNames.contains('products')) {
                //     db.createObjectStore('products', { keyPath: 'id', autoIncrement: true });
                // }
                
            };
            
            request.onsuccess = () => {
                this.db = request.result;
                resolve(this.db);
            };
            
            request.onerror = () => reject(request.error);
        });
    }
    
    async request(actionFn, mode = 'readonly') {
        
        const transaction = this.db.transaction(this.storeName, mode);
        const store = transaction.objectStore(this.storeName);
        
        return new Promise((resolve, reject) => {
            const request = actionFn(store);
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }
}

export const dbManager = new IndexedDBManager('crm', 3);
