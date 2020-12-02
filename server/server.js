require("./config/config");
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");


// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

//Hacemos una referencia al archivo rutas/index.js
//Configuracion global de rutas
app.use(require("./rutas/index"));

mongoose
    .connect(process.env.URLDB, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex:true,
        useFindAndModify:true,
    })
    .then(() => console.log("base de datos ONLINE"))
    .catch((err) => console.log("No se pudo conectar", err));

app.listen(process.env.PORT, () => {
    console.log("Escuchando puerto:", process.env.PORT);
});