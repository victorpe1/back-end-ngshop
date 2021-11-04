const mongoose = require("mongoose");

const proveedorSchema = mongoose.Schema({
    ruc: {
      type: String,
      required: true,
      index: { unique: true }
    },
    raz_social: {
      type: String,
      required: true,
    },
    estado: {
      type: String,
    },
    condicion: {
      type: String,
    },
    flgElim: {
      type: Boolean,
      default: false,
    },
  });
  
  proveedorSchema.virtual("id").get(function () {
      return this._id.toHexString();
    });
    
    proveedorSchema.set("toJSON", {
      virtuals: true,
    });
  module.exports = mongoose.model("Proveedor", proveedorSchema);
  