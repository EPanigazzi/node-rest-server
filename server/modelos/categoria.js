const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let categoriaSchema = new Schema({
    descripcion: {
        type: String,
        unique: true,
        required: [true, "La descripción es obligatoria"],
    },
    usuario: { type: Schema.Types.ObjectId, ref: "Usuario" }, // Incluimos y hacemos ref, a usario
                                                              // ref: tiene que ser igual que el nombre que se exporta
});

module.exports = mongoose.model("Categoria", categoriaSchema);
