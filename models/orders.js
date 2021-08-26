const mongoose = require("mongoose");

const pedidoSchema = mongoose.Schema({
  order_prods: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order_prod",
    required: true,
  }],
  envio_direcc1: {
    type: String,
    required: true,
  },
  envio_direcc2: {
    type: String,
  },
  ciudad: {
    type: String,
    required: true,
  },
  cod_postal: {
    type: String,
    required: true,
  },
  pais: {
    type: String,
    required: true,
  },
  telef: {
    type: String,
    required: true,
  },
  estado: {
    type: String,
    required: true,
    default: "Pendiente",
  },
  totalPrecio: {
    type: Number,
  },
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Usuario",
  },
  fecha_pedido: {
    type: Date,
    default: Date.now,
  },
});

pedidoSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

pedidoSchema.set("toJSON", {
  virtuals: true,
});

module.exports = mongoose.model("Order", pedidoSchema);
