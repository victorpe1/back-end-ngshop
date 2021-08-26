const mongoose = require("mongoose");

const usuarioSchema = mongoose.Schema({
  nombre: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  pass_encry: {
    type: String,
    required: true,
  },
  telef: {
    type: String,
    required: true,
  },
  admi: {
    type: Boolean,
    default: false,
  },
  apartamento: {
    type: String,
    default: "",
  },
  cod_postal: {
    type: String,
    default: "",
  },
  calle: {
    type: String,
    default: "",
  },
  ciudad: {
    type: String,
    default: "",
  },
  pais: {
    type: String,
    default: "",
  },
});

usuarioSchema.virtual("id").get(function () {
    return this._id.toHexString();
  });
  
  usuarioSchema.set("toJSON", {
    virtuals: true,
  });
module.exports = mongoose.model("Usuario", usuarioSchema);
