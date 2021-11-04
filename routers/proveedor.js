const express = require("express");
const router = express.Router();
const Proveedor = require("../models/proveedor");

router.get(`/`, async (req, res) => {
  const provedorList = await Proveedor.find({
    flgElim: false });

  if (!provedorList) return res.status(500).json({ success: false });

  res.status(200).send(provedorList);
});


router.get(`/:id`, async (req, res) => {
    const proveedor = await Proveedor.findById(req.params.id);
  
    if (!proveedor)
      return res
        .status(500)
        .json({ success: false, message: "Proveedor no ha sido encontrada" });
  
    res.status(200).send(proveedor);
  });


  router.post(`/`, async (req, res) => {
    
    let proveedor = new Proveedor({
      ruc: req.body.ruc,
      raz_social: req.body.raz_social,
      estado: req.body.estado,
      condicion: req.body.condicion
    });
    proveedor = await proveedor.save();
  
    if (!proveedor) return res.status(404).send("Proveedor no ha sido encontrada");
  
    res.send(proveedor);
  });
  

  router.delete(`/:id`, (req, res) => {
    Proveedor.findByIdAndUpdate(
      req.params.id,
      {
        flgElim: true
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
          message: "Proveedor no encontrada",
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
