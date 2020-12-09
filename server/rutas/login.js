const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Usuario = require("../modelos/usuario");
const app = express();
// google
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(process.env.CLIENT_ID);

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

// CONFIGURACIONES DE GOOGLE
async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();

    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true,
    };
}

app.post("/google", async (req, res) => {
    const token = req.body.idtoken;

    const googleUser = await verify(token).catch((e) => {
        return res.status(403).json({
            ok: false,
            err: e,
        });
    });

    Usuario.findOne({ email: googleUser.email }, (err, usuarioDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err,
            });
        }

        if (usuarioDB) {
            if (usuarioDB.google === false) {
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: "Debe de usar su autentificacion normal",
                    },
                });
            } else {
                const token = jwt.sign(
                    {
                        usuario: usuarioDB, // payload
                    },
                    process.env.SEED,
                    { expiresIn: process.env.CADUCIDAD_TOKEN } // expira en 30 dias
                );
                return res.json({
                    ok: true,
                    usuario: usuarioDB,
                    token,
                });
            }
        } else {
            // Si el usaurio no existe en nuestra DB
            const usuario = new Usuario();

            usuario.nombre = googleUser.nombre;
            usuario.email = googleUser.email;
            usuario.img = googleUser.img;
            usuario.google = true;
            usuario.password = ":)";

            usuario.save((err, usuarioDB) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        err,
                    });
                }

                const token = jwt.sign(
                    {
                        usuario: usuarioDB, // payload
                    },
                    process.env.SEED,
                    { expiresIn: process.env.CADUCIDAD_TOKEN } // expira en 30 dias
                );
                return res.json({
                    ok: true,
                    usuario: usuarioDB,
                    token,
                });
            });
        }
    });
});

module.exports = app;
