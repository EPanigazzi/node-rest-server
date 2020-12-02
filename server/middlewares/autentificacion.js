const jwt = require("jsonwebtoken");

// ======================
// VERIFICAR TOKEN
// ======================

const verificaToken = (req, res, next) => {
    const token = req.get("token"); //para obtener el valor de los header

    jwt.verify(token, process.env.SEED, (err, decoded) => {
        if (err) {
            return res.status(401).json({
                ok: false,
                err: {
                    message: "Token no valido",
                },
            });
        }

        req.usuario = decoded.usuario; // payload.usuario es equivalente
        next();
    });
};

// ======================
// VERIFICAR ADMIN ROL
// ======================

const verificaAdmin_Role = (req, res, next) => {
    const usuario = req.usuario;
    if (usuario.role === "ADMIN_ROLE") {
        next();
    } else{
        return res.json({
            ok: false,
            err: {
                message: "El usuario no es adminitrador",
            },
        });
    }
};

module.exports = {
    verificaToken,
    verificaAdmin_Role,
};
