const express = require("express");
const router = express.Router();
const Compra = require("../models/compra");
const Producto = require("../models/productos");
const Compra_producto = require("../models/compra-producto");
const Usuario = require("../models/usuarios");
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
  const compraLista = await Compra.find({
    flgElim: false,
  })
    .populate("usuario", "nombre")
    .sort({ fecha_create: -1 });

  if (!compraLista) return res.status(500).json({ success: false });

  res.status(200).send(compraLista);
});

router.get(`/:id`, async (req, res) => {
  const compra_producto = await Compra.findById({
    _id: req.params.id,
  })
    .populate("usuario", "nombre")
    .populate({
      path: "compra_prods",
      populate: {
        path: "producto",
        populate: "categoria",
      },
    });

  if (!compra_producto) return res.status(500).json({ success: false });

  res.status(200).send(compra_producto);
});

router.post(`/` ,uploadOption.single("image"), async (req, res) => {
  const compra_prod_id = Promise.all(
    req.body.compra_prods.map(async (order_producto) => {
      let newOrder_prod = new Compra_producto({
        cantidad: order_producto.cantidad,
        producto: order_producto.producto,
        precio_compra: order_producto.precio_compra,
        detalle: order_producto.detalle,
      });

      newOrder_prod = await newOrder_prod.save();

      let stock_act = 0,
        stock_nuevo = 0;

      let stock_actual = await Producto.findById(
       order_producto.producto
      ).select("cont_stock");

      stock_act = stock_actual.cont_stock;
   

      stock_nuevo = stock_act + order_producto.cantidad;

      console.log(stock_nuevo)

      let compra2 = await Producto.findByIdAndUpdate(
        order_producto.producto,
        {
          cont_stock: stock_nuevo,
        },
        { new: true }
      );
      
      if (!compra2) {
        return res.status(404).send("Compra no registrado");
      }

      return newOrder_prod._id;
    })
  );

  const file = req.file;
  let imagenP = "";

  if (!file) {

    const pathBasic = `${req.protocol}://${req.get("host")}/public/uploads/`;

    imagenP = `${pathBasic}defaultFactura.jpg`;

  } else {
    //file
    const fileName = req.file.filename;

    const pathBasic = `${req.protocol}://${req.get("host")}/public/uploads/`;

    imagenP = `${pathBasic}${fileName}`;
  }

  const order_prod_id_resolv = await compra_prod_id;

  let compra = new Compra({
    compra_prods: order_prod_id_resolv,
    image: imagenP,
    total_pagado: req.body.total_pagado,
    proveedor: req.body.proveedor,
    nota: req.body.nota,
    dia: req.body.dia,
    mes: req.body.mes,
    anio: req.body.anio,
    usuario: req.body.usuario,
  });

  compra = await compra.save();

  if (!compra) {
    return res.status(404).send("Compra no registrado");
  }

  res.status(200).send(compra);
});

router.put(`/:id`, uploadOption.single("image"), async (req, res) => {
  const compra = await Compra.findById(req.params.id);

  if (!compra) return res.status(400).send("Compra no encontrado");

  const file = req.file;

  let imagePath;

  if (file) {
    const fileName = file.filename;
    const pathBasic = `${req.protocol}://${req.get("host")}/public/uploads/`;
    imagePath = `${pathBasic}${fileName}`;
  } else {
    imagePath = compra.image;
  }

  const compraActualizada = await Compra.findByIdAndUpdate(
    req.params.id,
    {
      image: imagePath,
      proveedor: req.body.proveedor,
      total_pagado: req.body.total_pagado,
      dia: req.body.dia,
      mes: req.body.mes,
      anio: req.body.anio,
      nota: req.body.nota,
    },
    { new: true }
  );

  res.send(compraActualizada);
});

router.delete(`/:id`, (req, res) => {
  Compra.findByIdAndUpdate(
    req.params.id,
    {
      flgElim: true,
    },
    { new: true }
  )
    .then((compra) => {
      if (compra) {
        compra.compra_prods.map(async (order_producto) => {
          let cantidad_actual = await Compra_producto.find({
            _id: order_producto,
          })
            .select("cantidad")
            .select("producto");

          let cantidad = 0,
            id_producto = "";

          cantidad_actual.map((cal) => {
            cantidad = cal.cantidad;
            id_producto = cal.producto;
          });
          //4 - 6

          let stock_actual = await Producto.find(id_producto);

          let stock_act = 0;
          stock_actual.map((cal) => {
            stock_act += cal.cont_stock;
          });

          let stock_nuevo = stock_act - cantidad;

          const producto1 = await Producto.findByIdAndUpdate(
            {
              _id: id_producto,
            },
            {
              cont_stock: stock_nuevo,
            }
          );

          if (!producto1)
            return res.status(500).send("Producto no actualizado");
        });

        return res.status(200).json({
          success: true,
          message: "Eliminado correctamente",
        });
      } else {
        return res.status(404).json({
          success: false,
          message: "Compra no encontrada",
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

router.put(`/`, uploadOption.single("image"), async (req, res) => {

 let id_ultimo;

  const compra = await Compra.find().sort({ _id: -1 }).limit(1)

  compra.map((cal) => {
    id_ultimo = cal._id;
  });

  console.log(id_ultimo)

  const file = req.file;

  let imagePath;

  if (file) {
    const fileName = file.filename;
    const pathBasic = `${req.protocol}://${req.get("host")}/public/uploads/`;
    imagePath = `${pathBasic}${fileName}`;
  } else {
    imagePath = compra.image;
  }

  const compraActualizada = await Compra.findByIdAndUpdate(
    id_ultimo,
    {
      image: imagePath,
    },
    { new: true }
  );

  res.send(id_ultimo);
});


module.exports = router;
