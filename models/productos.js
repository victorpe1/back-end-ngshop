const mongoose = require("mongoose");

const productoSchema = mongoose.Schema({
  nombre: {
    type: String,
    required: true,
  },
  descripcion: {
    type: String,
    required: true,
  },
  grande_descripcion: {
    type: String,
    default: "",
  },
  image: {
    type: String,
    default: "",
  },
  images: [
    {
      type: String,
    },
  ],
  marca: {
    type: String,
    default: "",
  },
  precio: {
    type: Number,
    default: 0,
  },
  categoria: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Categoria",
    required: true,
  },
  cont_stock: {
    type: Number,
    required: true,
    min: 0,
    max: 255,
  },
  calificacion: {
    type: Number,
    default: 0,
  },
  numReviews: {
    type: Number,
    default: 0,
  },
  destacado: {
    type: Boolean,
    default: false,
  },
  fecha_creacion: {
    type: Date,
    default: Date.now,
  },
});

productoSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

productoSchema.set("toJSON", {
  virtuals: true,
});

module.exports = mongoose.model("Producto", productoSchema);
