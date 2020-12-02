const express = require("express");
const bcrypt = require("bcrypt");
const _ = require("underscore");
const Usuario = require("../modelos/usuario");
const { verificaToken, verificaAdmin_Role } = require("../middlewares/autentificacion");
const app = express();

app.get("/usuario", verificaToken, (req, res) => {
    // verificaToken no va con () porque no la estiy llamando sino que solo estoy diciendo que se va disparar en esa ruta

    // return res.json({
    //     usuario: req.usuario,
    //     nombre: req.usuario.nombre,
    //     email: req.usuario.email,
    // });

    let desde = req.query.desde || 0;
    desde = Number(desde);

    let limite = req.query.limite || 5;
    limite = Number(limite);

    Usuario.find({ estado: true }, "nombre email role estado google img") // segundo argumento los campos que quiero mostrar
        .skip(desde)
        .limit(limite)
        .exec((err, usuarios) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err,
                });
            }

            Usuario.countDocuments({ estado: true }, (err, conteo) => {
                res.json({
                    ok: true,
                    usuarios,
                    cuantos: conteo,
                });
            });
        });
});

app.post("/usuario", [verificaToken,verificaAdmin_Role],function (req, res) {
    const body = req.body;

    const usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        role: body.role,
    });

    usuario.save((err, usuarioDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err,
            });
        }

        //Una forma de borrar la contraseña en la respuesta pero la usada en
        // modelos/usuarios.js es mas eficaz
        // usuarioDB.password = null;

        res.json({
            ok: true,
            usuario: usuarioDB,
        });
    });
});

app.put("/usuario/:id", [verificaToken,verificaAdmin_Role],function (req, res) {
    const id = req.params.id;
    const body = _.pick(req.body, ["nombre", "email", "img", "role", "estado"]);

    Usuario.findByIdAndUpdate(
        id,
        body,
        { new: true, runValidators: true },
        (err, usuarioDB) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err,
                });
            }

            res.json({
                ok: true,
                usuario: usuarioDB,
            });
        }
    );
});

app.delete("/usuario/:id", [verificaToken,verificaAdmin_Role], function (req, res) {
    const id = req.params.id;

    // BORRADO FISICO
    // Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {
    //     if (err) {
    //         return res.status(400).json({
    //             ok: false,
    //             err,
    //         });
    //     }
    //     if (!usuarioBorrado) {
    //         return res.status(400).json({
    //             ok: false,
    //             err: {
    //                 message: "Usuario no encontrado",
    //             },
    //         });
    //     }

    //     res.json({
    //         ok: true,
    //         usuario: usuarioBorrado,
    //     });
    // });
    // BORRADO FISICO

    //BORRADO LOGICO
    const cambiaEstado = {
        estado: false,
    };
    Usuario.findByIdAndUpdate(
        id,
        cambiaEstado,
        { new: true },
        (err, usuarioBorrado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err,
                });
            }
            if (!usuarioBorrado) {
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: "Usuario no encontrado",
                    },
                });
            }

            res.json({
                ok: true,
                usuario: usuarioBorrado,
            });
        }
    );
    //BORRADO LOGICO
});

module.exports = app;
