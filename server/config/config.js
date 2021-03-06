// VARIABLES DE FORMA GLOBAL

// ===================
// PUERTO
//====================
process.env.PORT = process.env.PORT || 3000;

// ===================
// ENTORNO
//====================
process.env.NODE_ENV = process.env.NODE_ENV || "dev";

// ===================
// VENCIMIENTO DEL TOKEN
//====================
// 60 segundos
// 60 minutos
// 24 horas
// 30 dias

process.env.CADUCIDAD_TOKEN = '48h';

// ===================
// SEED DE AUTENTIFICACION
//====================

process.env.SEED = process.env.SEED || "este-es-el-seed-de-desarrollo";

// ===================
// BASE DE DATOS
//====================
let urlDB;

if (process.env.NODE_ENV === "dev") {
    urlDB = "mongodb://localhost:27017/cafe";
} else {
    urlDB = process.env.MONGO_URI;
}
// enviroment inventado para usar en server.js
process.env.URLDB = urlDB;

// ===================
// GOOGLE CLIENT ID
//====================

process.env.CLIENT_ID =
    process.env.CLIENT_ID ||
    "801244957720-c6jje2gmf5pj8sp0g34elimb8shn7jkn.apps.googleusercontent.com";
