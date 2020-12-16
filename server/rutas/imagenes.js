const express = require("express");
const fs = require("fs");
const path = require("path");
const app = express();
const { verificaTokenImg } = require("../middlewares/autentificacion");

app.get("/imagen/:tipo/:img", verificaTokenImg,(req, res) => {
    const tipo = req.params.tipo;
    const img = req.params.img;

    const pathImagen = path.resolve(__dirname, `../../uploads/${tipo}/${img}`);

    //Verifico si el PATH existe
    if (fs.existsSync(pathImagen)) {
        res.sendFile(pathImagen);
    } else {
        //Path Absoluto
        const noImagePath = path.resolve(__dirname, "../assets/no-image.jpg");
        res.sendFile(noImagePath);
    }
});

module.exports = app;
