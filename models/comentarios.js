const mongoose = require("mongoose");

const comentarioSchema = mongoose.Schema({
   producto: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Producto",
    required: true,
  },
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Usuario",
    required: true,
  },
  comentario: {
    type: String,
  },
  estrellas: {
    type: Number,
    required: true,
  },
  fchaCreacion: {
    type: Date,
    default: Date.now,
  },
});

comentarioSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

comentarioSchema.set("toJSON", {
  virtuals: true,
});

module.exports = mongoose.model("Comentario", comentarioSchema);
