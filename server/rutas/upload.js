const express = require("express");
const fileUpload = require("express-fileupload");
const usuario = require("../modelos/usuario"); // para poder acceder a la img
const app = express();
// para acceder al path y saber si el archivo existe
const fs = require("fs");
const path = require("path");

const Usuario = require("../modelos/usuario");
const Producto = require("../modelos/producto");

//default options
app.use(fileUpload());

app.put("/upload/:tipo/:id", (req, res) => {
    const tipo = req.params.tipo;
    const id = req.params.id;

    if (!req.files) {
        return res.status(400).json({
            ok: false,
            err: {
                message: "No se ha seleccionado ningun archivo",
            },
        });
    }

    //Validar TIPO
    const tiposValidos = ["productos", "usuarios"];
    if (tiposValidos.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            err: {
                message: `Los tipos permitidos son ${tiposValidos.join(", ")}`,
            },
            tipo,
        });
    }

    const archivo = req.files.archivo;
    const nombreCortado = archivo.name.split(".");
    const extension = nombreCortado[nombreCortado.length - 1];

    // Extensiones permitidas
    const extensionesValidas = ["png", "jpg", "gif", "jpeg"];

    //Busco dentro del array una extension valida
    if (extensionesValidas.indexOf(extension) < 0) {
        return res.status(400).json({
            ok: false,
            err: {
                message: `Las extensiones permitidas son ${extensionesValidas.join(
                    ", "
                )}`,
            },
            ext: extension,
        });
    }

    // Cambiar nombre al archivo
    // id-milisegundos.extension
    const nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extension}`;

    archivo.mv(`uploads/${tipo}/${nombreArchivo}`, (err) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err, // Aca ya nos va a decir que tipo de error
            });
        }
        // En este punto la imagen ya esta cargada
        if (tipo === "productos") {
            imagenProducto(id, res, nombreArchivo);
        } else {
            imagenUsuario(id, res, nombreArchivo);
        }
    });
});

const imagenUsuario = (id, res, nombreArchivo) => {
    Usuario.findById(id, (err, usuarioDB) => {
        if (err) {
            borraArchivo(nombreArchivo, "usuarios");
            return res.status(500).json({
                ok: false,
                err,
            });
        }
        if (!usuarioDB) {
            borraArchivo(nombreArchivo, "usuarios");
            return res.status(400).json({
                ok: false,
                err: {
                    message: "Usuario no existe",
                },
            });
        }

        borraArchivo(usuarioDB.img, "usuarios");

        usuarioDB.img = nombreArchivo;
        usuarioDB.save((err, usuarioGuardado) => {
            res.json({
                ok: true,
                usuario: usuarioGuardado,
                img: nombreArchivo,
            });
        });
    });
};

const imagenProducto = (id, res, nombreArchivo) => {
    Producto.findById(id, (err, productoDB) => {
        if (err) {
            borraArchivo(nombreArchivo, "productos");
            return res.status(500).json({
                ok: false,
                err,
            });
        }
        if (!productoDB) {
            borraArchivo(nombreArchivo, "productos");
            return res.status(400).json({
                ok: false,
                err: {
                    message: "El producto no existe",
                },
            });
        }

        borraArchivo(productoDB.img, "usuarios");

        productoDB.img = nombreArchivo;
        productoDB.save((err, productoGuardado) => {
            res.json({
                ok: true,
                producto: productoGuardado,
                img: nombreArchivo,
            });
        });
    });
};

const borraArchivo = (nombreImagen, tipo) => {
    const pathImagen = path.resolve(
        __dirname,
        `../../uploads/${tipo}/${nombreImagen}`
    );
    //Borro para que quede solo la ultima imagen, solo en caso que exista
    if (fs.existsSync(pathImagen)) {
        fs.unlinkSync(pathImagen);
    }
};

module.exports = app;
