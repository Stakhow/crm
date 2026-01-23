import {dbManager} from "../config/db.js";
import Client from "../backend/controllers/client/index.js";

const client = new Client();

async function runDatabaseDemo() {
    try {
        
        const db = await dbManager.connect();
    
        window.addEventListener("load", async (event) => {
            
            const clients = await client.getAll();
            
            document.querySelector('#list').innerHTML = clients.map(i => `<li>{${i.name} ${i.phone}} <button class="clientDelete" id="${i.id}">Delete ID: ${i.id}</button></li>`).join('');
        
            document.querySelectorAll('.clientDelete').forEach((i) => {
            
                i.onclick = async (e) => {
                
                    await client.delete(+e.target.id);
                
                    i.closest('li').remove();
                };
            
            });
        });
    
        const clientForm = document.querySelector('#clientForm');
    
        clientForm.addEventListener('submit', async function (e) {
        
            e.preventDefault();
        
            const formData = Object.fromEntries(new FormData(e.target));
        
            client.create({ name: formData.name, phone: formData.phone })
                .then(clientId => {
                    console.log('clientId', clientId);
                }).catch(i => {
                console.log('error', i);
            })
        });
    
    
    } catch (error) {
        console.error(error);
    }
}

runDatabaseDemo();

