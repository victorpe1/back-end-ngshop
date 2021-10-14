const mongoose = require("mongoose");

const compraSchema = mongoose.Schema({
  compra_prods: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Compra_prod",
      required: true,
    },
  ],
  total_pagado: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    default: "",
  },
  proveedor: {
    type: String,
  },
  nota: {
    type: String,
    required: true,
  },
  dia: {
    type: String,
  },
  mes: {
    type: String,
  },
  anio: {
    type: String,
  },
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Usuario",
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

compraSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

compraSchema.set("toJSON", {
  virtuals: true,
});

module.exports = mongoose.model("Compra", compraSchema);
