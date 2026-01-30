// import { dbManager } from "../../config/db.ts";

// export default class ClientModel {
//   constructor() {
//     this.storeName = "clients";
//   }

//   async #request(actionFn, mode = "readonly") {
//     await dbManager.connect();

//     const transaction = dbManager.db.transaction(this.storeName, mode);
//     const store = transaction.objectStore(this.storeName);

//     return new Promise((resolve, reject) => {
//       const request = actionFn(store);

//       request.onsuccess = () => resolve(request.result);
//       request.onerror = () => reject(request.error);
//     });
//   }

//   async add({ name, phone }) {
//     return this.#request(
//       (s) => s.add({ name, phone, createdAt: new Date() }),
//       "readwrite",
//     );
//   }

//   async getAll() {
//     return this.#request((s) => s.getAll());
//   }

//   async get(id) {
//     return this.#request((s) => s.get(id));
//   }

//   async delete(id) {
//     return this.#request((s) => s.delete(id), "readwrite");
//   }

//   async getByIndex(index, value) {
//     const transaction = dbManager.db.transaction(["clients"], "readonly");
//     const store = transaction.objectStore("clients");
//     const newIndex = store.index(index);

//     return new Promise((resolve, reject) => {
//       const request = newIndex.openCursor(IDBKeyRange.only(value));

//       const res = [];

//       request.onsuccess = (event) => {
//         const cursor = event.target.result;
//         if (cursor) {
//           res.push(cursor.value);
//           cursor.continue();
//         } else {
//           // Not found
//         }

//         resolve(res);
//       };

//       request.onerror = () => reject(request.error);
//     });
//   }
// }
