const express = require("express");
const router = express.Router();
const Usuario = require("../models/usuarios");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

router.get(`/`, async (req, res) => {
  const usuariosLista = await Usuario.find({
    flgElimUs: false,
  }).select("-pass_encry");

  if (!usuariosLista) return res.status(500).json({ success: false });

  res.status(200).send(usuariosLista);
});

router.post(`/`, async (req, res) => {
  let usuario = new Usuario({
    nombre: req.body.nombre,
    email: req.body.email,
    pass_encry: bcrypt.hashSync(req.body.password, 10),
    telef: req.body.telef,
    admi: req.body.admi,
    apartamento: req.body.apartamento,
    cod_postal: req.body.cod_postal,
    calle: req.body.calle,
    ciudad: req.body.ciudad,
    pais: req.body.pais,
  });
  usuario = await usuario.save()

  if(!usuario)
    return res.status(400).send('El usuario no ha sido creado!')

  res.send(usuario);
});

router.get(`/:id`, async (req, res) => {
  const usuario = await Usuario.findById(req.params.id).select("-pass_encry");

  if (!usuario)
    return res
      .status(500)
      .json({ success: false, message: "El usuario no ha sido encontrado" });

  res.status(200).send(usuario);
});

router.put(`/:id`, async (req, res) => {
  const usuarioExiste = await Usuario.findById(req.params.id);
  let newPassword;
  if (req.body.password) {
    newPassword = bcrypt.hashSync(req.body.password, 10);
  } else {
    newPassword = usuarioExiste.pass_encry;
  }

  const usuario = await Usuario.findByIdAndUpdate(
    req.params.id,
    {
      nombre: req.body.nombre,
      email: req.body.email,
      pass_encry: newPassword,
      telef: req.body.telef,
      admi: req.body.admi,
      apartamento: req.body.apartamento,
      cod_postal: req.body.cod_postal,
      calle: req.body.calle,
      ciudad: req.body.ciudad,
      pais: req.body.pais,
    },
    { new: true }
  );

  if (!usuario) return res.status(404).send("Usuario no editado");

  res.send(usuario);
});

router.post(`/login`, async (req, res) => {
  const usuario = await Usuario.findOne({ email: req.body.email, flgElimUs: false });
  const secret = process.env.secret;

  if (!usuario) return res.status(400).send("Usuario no existe");

  if (usuario && bcrypt.compareSync(req.body.password, usuario.pass_encry)) {
    const token = jwt.sign(
      {
        userId: usuario.id,
        admi: usuario.admi,

      },
        secret,
      { expiresIn: "1d" }
    );

    return res.status(200).send({usuario: usuario.email, token: token});
  } else return res.status(400).send("Contraseña incorrecta");
});

router.post(`/registro`, async (req, res) => {

  let usuario = new Usuario({
    nombre: req.body.nombre,
    email: req.body.email,
    pass_encry: bcrypt.hashSync(req.body.password, 10),
    telef: " ",
    admi: true,
    apartamento: " ",
    cod_postal: " ",
    calle: " ",
    ciudad: " ",
    pais: " ",
  });
  usuario = await usuario.save()

  if(!usuario)
    return res.status(400).send('El usuario no ha sido creado!')

  res.send(usuario);
});

router.get(`/get/cant`, async (req, res) => {
  const contUsuarios = await Usuario.countDocuments((cant) => cant);

  if (!contUsuarios)
    return res
      .status(500)
      .json({ success: false, message: "El producto no ha sido encontrado" });

  res.send({
    contUsuarios: contUsuarios,
  });
});


router.delete(`/:id`, (req, res) => {
  Usuario.findByIdAndUpdate(
    req.params.id,
    {
      flgElimUs: true
    },
    { new: true }
  ).then((usuario) => {
    if (usuario) {
      return res.status(200).json({
        success: true,
        message: "Eliminado correctamente",
      });
    } else {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrada",
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
