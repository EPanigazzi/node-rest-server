const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Usuario = require("../modelos/usuario");
const app = express();

app.post("/login", (req, res) => {
    //Con esto ya obtengo todo lo que el usario me escribio
    const body = req.body;

    //En este caso el error solo ocurriria si hubo algo mal en la DB
    //Porque si email no es valido usuarioDB lo devuelve NULL
    Usuario.findOne({ email: body.email }, (err, usuarioDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err,
            });
        }

        if (!usuarioDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: "(Usuario) o contraseña incorrectos",
                },
            });
        }

        if (!bcrypt.compareSync(body.password, usuarioDB.password)) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: "Usuario o (contraseña) incorrectos",
                },
            });
        }

        const token = jwt.sign(
            {
                usuario: usuarioDB, // payload
            },
            process.env.SEED,
            { expiresIn: process.env.CADUCIDAD_TOKEN } // expira en 30 dias
        );

        res.json({
            ok: true,
            usuario: usuarioDB,
            token,
        });
    });
});

module.exports = app;
