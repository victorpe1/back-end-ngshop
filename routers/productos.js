const express = require("express");
const router = express.Router();
const Producto = require("../models/productos");
const Categoria = require("../models/categorias");
const mongoose = require("mongoose");
const multer = require("multer");

const FILE_TYPE = {
  "image/png": "png",
  "image/jpg": "jpg",
  "image/jpeg": "jpeg",
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const validarFile = FILE_TYPE[file.mimetype];
    let errorValidacion = new Error("Archivo no permitido");
    if (validarFile) {
      errorValidacion = null;
    }
    cb(errorValidacion, "public/uploads");
  },
  filename: function (req, file, cb) {
    const fileName = file.originalname.split(" ").join("-");
    const extension = FILE_TYPE[file.mimetype];
    cb(null, `${fileName}-${Date.now()}.${extension}`);
  },
});

const uploadOption = multer({ storage: storage });

router.get(`/`, async (req, res) => {

  let filtro = {};
  if (req.query.categorias) {
    filtro = { categoria: req.query.categorias.split(",") };
  }

  const productoList = await Producto.find(filtro).populate("categoria");
  
  if (!productoList) return res.status(500).json({ success: false });

  res.status(200).send(productoList);
});

router.get(`/:id`, async (req, res) => {
  const producto = await Producto.findById(req.params.id).populate("categoria");

  if (!producto)
    return res
      .status(500)
      .json({ success: false, message: "El producto no ha sido encontrado" });

  res.status(200).send(producto);
});




router.post(`/`, uploadOption.single("image"), async (req, res) => {
  const categoria = await Categoria.findById(req.body.categoria);
  if (!categoria) return res.status(400).send("Categoria no encontrado");

  const file = req.file;
  if (!file) return res.status(400).send("Imagen no encontrado");

  //file
  const fileName = req.file.filename;
  const pathBasic = `${req.protocol}://${req.get("host")}/public/uploads/`;

  let producto = new Producto({
    nombre: req.body.nombre,
    descripcion: req.body.descripcion,
    grande_descripcion: req.body.grande_descripcion,
    image: `${pathBasic}${fileName}`,
    marca: req.body.marca,
    precio: req.body.precio,
    categoria: req.body.categoria,
    cont_stock: req.body.cont_stock,
    calificacion: req.body.calificacion,
    numReviews: req.body.numReviews,
    destacado: req.body.destacado,
  });

  producto = await producto.save();

  if (!producto) return res.status(404).send("Producto no registrado");

  res.status(200).send(producto);
});

router.put(`/:id`, uploadOption.single("image"), async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    res.status(400).send("ID del producto invalido");
  }
  const categoria = await Categoria.findById(req.body.categoria);
  if (!categoria) return res.status(400).send("Categoria no encontrado");

  const producto = await Producto.findById(req.params.id);
      if (!producto) return res.status(400).send('Producto invalido!');

  const file = req.file;

  if (!file) return res.status(400).send("Imagen no encontrado");

  //file
  let imagePath;

  if (file) {
    const fileName = file.filename;
    const pathBasic = `${req.protocol}://${req.get("host")}/public/uploads/`;
    imagePath = `${pathBasic}${fileName}`;
  }else{
    imagePath = producto.image;
  }

  const productoActualizado = await Producto.findByIdAndUpdate(
    req.params.id,
    {
      nombre: req.body.nombre,
      descripcion: req.body.descripcion,
      grande_descripcion: req.body.grande_descripcion,
      image: imagePath,
      marca: req.body.marca,
      precio: req.body.precio,
      categoria: req.body.categoria,
      cont_stock: req.body.cont_stock,
      calificacion: req.body.calificacion,
      numReviews: req.body.numReviews,
      destacado: req.body.destacado,
    },
    { new: true }
  );

  //producto = await producto.save();

  if (!productoActualizado) return res.status(500).send("Producto no actualizado");

  res.status(200).send(productoActualizado);
});

router.delete(`/:id`, (req, res) => {
  Producto.findByIdAndRemove(req.params.id)
    .then((producto) => {
      if (producto) {
        return res.status(200).json({
          success: true,
          message: "Eliminado correctamente",
        });
      } else {
        return res.status(404).json({
          success: false,
          message: "Producto no encontrada",
        });
      }
    })
    .catch((error) => {
      return res.status(404).json({
        success: false,
        error: err,
      });
    });
});

router.get(`/get/cant`, async (req, res) => {
  const contProducto = await Producto.countDocuments((cant) => cant);

  if (!contProducto)
    return res
      .status(500)
      .json({ success: false, message: "El producto no ha sido encontrado" });

  res.send({
    contProducto: contProducto,
  });
});

router.get(`/get/destacado/:cant`, async (req, res) => {
  const cant = req.params.cant ? req.params.cant : 0;
  const productos = await Producto.find({ destacado: true }).limit(+cant);

  if (!productos)
    return res.status(500).json({
      success: false,
      message: "El productos destacados no ha sido encontrado",
    });

    res.status(200).send(productos);
});

router.put(
  `/galeria-imgs/:id`,
  uploadOption.array("images", 10),
  async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
      res.status(400).send("ID del producto invalido");
    }

    const files = req.files;
    if (!files) return res.status(400).send("Imagen no encontrado");

    //file
    let imagesPath = [];
    const pathBasic = `${req.protocol}://${req.get("host")}/public/uploads/`;

    if (files) {
      files.map((file) => {
        imagesPath.push(`${pathBasic}${file.filename}`);
      });
    }

    const producto = await Producto.findByIdAndUpdate(
      req.params.id,
      {
        images: imagesPath,
      },
      { new: true }
    );

    //producto = await producto.save();

    if (!producto) return res.status(404).send("Producto no actualizado");

    res.status(200).send(producto);
  }
);

module.exports = router;
