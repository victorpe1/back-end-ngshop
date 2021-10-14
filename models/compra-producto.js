const mongoose = require("mongoose");

const compra_productos = mongoose.Schema({
    cantidad: {
        type: Number,
        required: true,
    },
    producto: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Producto"
    },
    precio_compra: {
        type: Number,
        default: 0
    },
    detalle: {
        type: String,
        default: ""
    },
    fecha_create: {
      type: Date,
      default: Date.now,
    },
    flgElim: {
      type: Boolean,
      default: false,
    },
  });

  compra_productos.virtual("id").get(function () {
    return this._id.toHexString();
  });
  
  compra_productos.set("toJSON", {
    virtuals: true,
  });

module.exports = mongoose.model("Compra_prod", compra_productos);