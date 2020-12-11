const { json } = require("express");
const express = require("express");
const { verificaToken } = require("../middlewares/autentificacion");
const categoria = require("../modelos/categoria");
const app = express();
const Producto = require("../modelos/producto");

// =====================
// Obtener productos
// =====================
app.get("/producto", verificaToken, (req, res) => {
    //traer todos los productos
    // populate: usuario categoria

    // paginado
    let desde = req.query.desde || 0;
    desde = Number(desde);
    let hasta = req.query.hasta || 5;
    hasta = Number(hasta);

    Producto.find({ disponible: true }, "nombre precioUni categoria")
        .skip(desde)
        .limit(hasta)
        .sort("nombre")
        .populate("usuario", "nombre email estado")
        .populate("categoria", "descripcion")
        .exec((err, productos) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err,
                });
            }

            Producto.countDocuments({ disponible: true }, (err, conteo) => {
                res.status(200).json({
                    ok: true,
                    productos,
                    cantidadTotal: conteo,
                });
            });
        });
});

// =====================
// Obtener productoss
// =====================
app.get("/producto/:id", (req, res) => {
    // populate: usuario categoria
    const id = req.params.id;

    Producto.findById(id)
        .populate("usuario", "nombre email")
        .populate("categoria", "nombre")
        .exec((err, productos) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err: {
                        message: "El ID no es correcto",
                    },
                });
            }
            if (!productos) {
                return res.status(400).json({
                    ok: false,
                    err,
                });
            }

            res.status(200).json({
                ok: true,
                productos,
            });
        });
});
// =====================
// Buscar productos
// =====================
app.get("/producto/buscar/:termino", verificaToken, (req, res) => {
    const termino = req.params.termino;

    const regex = new RegExp(termino, 'i');

    Producto.find({nombre: regex})
        .populate("categoria", "nombre")
        .exec((err, productos) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err,
                });
            }
            res.json({
                ok: true,
                productos,
            });
        });
});

// =====================
// Crear productos
// =====================
app.post("/producto", verificaToken, (req, res) => {
    const body = req.body;

    const producto = new Producto({
        usuario: req.usuario._id,
        nombre: body.nombre,
        precioUni: body.precioUni,
        descripcion: body.descripcion,
        disponible: body.disponible,
        categoria: body.categoria,
    });

    producto.save((err, productoDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err,
            });
        }
        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                err,
            });
        }

        res.status(201).json({
            ok: true,
            producto: productoDB,
        });
    });
});

// =====================
// Actualizar productos
// =====================
app.put("/producto/:id", verificaToken, (req, res) => {
    const id = req.params.id;
    const body = req.body;

    camposActualizar = {
        nombre: body.nombre,
        precioUni: body.precioUni,
        descripcion: body.descripcion,
        disponible: body.disponible,
        categoria: body.categoria,
    };

    Producto.findByIdAndUpdate(
        id,
        camposActualizar,
        { new: true, runValidators: true },
        (err, productoDB) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err: {
                        message: "El ID no es correcto",
                    },
                });
            }
            if (!productoDB) {
                return res.status(400).json({
                    ok: false,
                    err,
                });
            }
            res.status(200).json({
                ok: true,
                producto: productoDB,
            });
        }
    );
});

// =====================
// Borrar un producto
// =====================
app.delete("/producto/:id", verificaToken, (req, res) => {
    // cambiar el estado "Disponible"
    // Borrado logico
    const id = req.params.id;
    cambioEstado = {
        disponible: false,
    };

    Producto.findByIdAndUpdate(
        id,
        cambioEstado,
        { new: true },
        (err, productoBorrado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err,
                });
            }
            if (!productoBorrado) {
                return res.status(500).json({
                    ok: false,
                    err: {
                        message: "El ID no es correcto",
                    },
                });
            }
            res.status(200).json({
                ok: true,
                producto: productoBorrado,
                message: "El producto ahora no esta disponible",
            });
        }
    );
});

module.exports = app;
