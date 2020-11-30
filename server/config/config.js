// VARIABLES DE FORMA GLOBAL

// ===================
// PUERTO
//====================
process.env.PORT = process.env.PORT || 3000;

// ===================
// ENTORNO
//====================
process.env.NODE_ENV = process.env.NODE_ENV || 'dev';

// ===================
// BASE DE DATOS
//====================
let urlDB;

if(process.env.NODE_ENV === 'dev'){
    urlDB = 'mongodb://localhost:27017/cafe'
}else{
    urlDB = 'mongodb+srv://pani-admin:y0zTveG0ryVJF010@pani-pruebas.gmweq.mongodb.net/test'
}
// enviroment inventado para usar en server.js
process.env.URLDB = urlDB