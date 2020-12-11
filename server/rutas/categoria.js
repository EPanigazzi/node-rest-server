const { json } = require("express");
const express = require("express");
const { CodeChallengeMethod } = require("google-auth-library");
const {
    verificaToken,
    verificaAdmin_Role,
} = require("../middlewares/autentificacion");
const categoria = require("../modelos/categoria");
const app = express();
const Categoria = require("../modelos/categoria");

// Muestra todas las categorias
app.get("/categoria", verificaToken, (req, res) => {
    Categoria.find({})
        .sort("descripcion")
        .populate("usuario", "nombre email")
        .exec((err, categorias) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err,
                });
            }

            res.json({
                ok: true,
                categorias,
            });
        });
});

// Muestra una categoria por id
app.get("/categoria/:id", verificaToken, (req, res) => {
    const id = req.params.id;
    Categoria.findById(id, (err, categoriaDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err,
            });
        }
        if (!categoriaDB) {
            return res.status(500).json({
                ok: false,
                err: {
                    message: "El ID no es correcto",
                },
            });
        }
        res.json({
            ok: true,
            categoria: categoriaDB,
        });
    });
});

// Crear nueva categoria
app.post("/categoria", verificaToken, (req, res) => {
    const body = req.body;

    const categoria = new Categoria({
        descripcion: body.descripcion,
        usuario: req.usuario._id,
    });

    categoria.save((err, categoriaDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err,
            });
        }

        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                err,
            });
        }

        res.json({
            ok: true,
            categoria: categoriaDB,
        });
    });
});

// Actualizar nueva categoria
app.put("/categoria/:id", [verificaToken, verificaAdmin_Role], (req, res) => {
    const body = req.body;
    const id = req.params.id;

    const descCategoria = {
        descripcion: body.descripcion,
    };

    Categoria.findByIdAndUpdate(
        id,
        descCategoria,
        { new: true, runValidators: true },
        (err, categoriaDB) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err,
                });
            }
            if (!categoriaDB) {
                return res.json(400).json({
                    ok: false,
                    err: {
                        message: "El ID no existe",
                    },
                });
            }
            res.json({
                ok: true,
                categoria: categoriaDB,
            });
        }
    );
});

// Borra una categoria por id
app.delete(
    "/categoria/:id",
    [verificaToken, verificaAdmin_Role],
    (req, res) => {
        const id = req.params.id;
        Categoria.findByIdAndRemove(id, (err, categoriaDB) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err,
                });
            }
            if (!categoriaDB) {
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: "El ID no existe",
                    },
                });
            }
            res.json({
                ok: true,
                message: "Categoria borrada",
            });
        });
    }
);

module.exports = app;
