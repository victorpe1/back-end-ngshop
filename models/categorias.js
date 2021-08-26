const mongoose = require("mongoose");

const categoriaSchema = mongoose.Schema({
    nombre: {
        type: String,
        required: true,
    },
    icon: {
        type: String,
    },
    color: {
        type: String
    }
  });

  
module.exports = mongoose.model("Categoria", categoriaSchema);