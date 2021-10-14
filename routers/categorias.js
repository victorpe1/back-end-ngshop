const express = require("express");
const router = express.Router();
const Categoria = require("../models/categorias");

router.get(`/`, async (req, res) => {
  const categoriaList = await Categoria.find({
    flgElimCat: false });

  if (!categoriaList) return res.status(500).json({ success: false });

  res.status(200).send(categoriaList);
});

router.get(`/:id`, async (req, res) => {
  const categoria = await Categoria.findById(req.params.id);

  if (!categoria)
    return res
      .status(500)
      .json({ success: false, message: "La categoria no ha sido encontrada" });

  res.status(200).send(categoria);
});


router.post(`/`, async (req, res) => {
  let categoria = new Categoria({
    nombre: req.body.nombre,
    icon: req.body.icon,
    color: req.body.color,
  });
  categoria = await categoria.save();

  if (!categoria) return res.status(404).send("Categoria Not Found");

  res.send(categoria);
});

router.put(`/:id`, async (req, res) => {
  const categoria = await Categoria.findByIdAndUpdate(
    req.params.id,
    {
      nombre: req.body.nombre,
      icon: req.body.icon,
      color: req.body.color,
    },
    { new: true }
  );

  if (!categoria) return res.status(404).send("Categoria no editado");

  res.send(categoria);
});

router.delete(`/:id`, (req, res) => {
  Categoria.findByIdAndUpdate(
    req.params.id,
    {
      flgElimCat: true
    },
    { new: true }
  ).then((cat) => {
    if (cat) {
      return res.status(200).json({
        success: true,
        message: "Eliminado correctamente",
      });
    } else {
      return res.status(404).json({
        success: false,
        message: "Categoria no encontrada",
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

module.exports = router;
