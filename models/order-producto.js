const mongoose = require("mongoose");

const order_productos = mongoose.Schema({
    cantidad: {
        type: Number,
        required: true,
    },
    producto: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Producto"
    }
  });

  order_productos.virtual("id").get(function () {
    return this._id.toHexString();
  });
  
  order_productos.set("toJSON", {
    virtuals: true,
  });

module.exports = mongoose.model("Order_prod", order_productos);