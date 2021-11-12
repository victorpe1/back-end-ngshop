const express = require("express");
const router = express.Router();
const Compra = require("../models/compra");
const Producto = require("../models/productos");
const Compra_producto = require("../models/compra-producto");
const Order_producto = require("../models/order-producto");
const Pedido = require("../models/orders");

const Usuario = require("../models/usuarios");
const mongoose = require("mongoose");

router.get(`/kardex_simple/:id`, async (req, res) => {
  var aux = [];
  var json_existencia = [];
  //console.log(JSON.stringify(aux));

  const compraLista = await Compra_producto.find({
    flgElim: false,
  })
    .populate("producto", "nombre")
    .sort({ fecha_create: -1 });

  const compraListaFiltro = compraLista.filter(
    (compra) => compra.producto.id == req.params.id
  );

  for (var compra of compraListaFiltro) {
    var data = {

      detalle: compra.detalle,
      fecha_create: compra.fecha_create,

      id_compra: compra._id,
      cantidad_compra: compra.cantidad,
      precio_compra: compra.precio_compra,
      valor_total_compra: compra.precio_compra * compra.cantidad,

      id_venta: "",
      cantidad_venta: "",
      precio_venta: "",
      valor_total_venta: "",

      cantidad_existencia: "",
      precio_existencia: "",
      valor_total_existencia: "",
    };

    
    aux.push(data);
  }

  const pedido = await Pedido.find({})
    .populate("usuario", "nombre")
    .populate({
      path: "order_prods",
      populate: {
        path: "producto",
        select: ["nombre", "precio"],
      },
    })
    .select(["order_prods", "producto", "usuario", "fecha_pedido"]);

  const ventaListaFiltro = pedido.filter(
    (venta) => venta.order_prods[0].producto._id == req.params.id
  );

  for (var venta of ventaListaFiltro) {
    var data = {

      detalle: venta.usuario.nombre,
      fecha_create: venta.fecha_pedido,

      id_compra: "",
      cantidad_compra: "",
      precio_compra: "",
      valor_total_compra: "",

      id_venta: venta._id,
      cantidad_venta: venta.order_prods[0].cantidad,
      precio_venta: venta.order_prods[0].producto.precio,
      valor_total_venta: venta.order_prods[0].producto.precio * venta.order_prods[0].cantidad,

      cantidad_existencia: "",
      precio_existencia: "",
      valor_total_existencia: "",
    };
    
    aux.push(data);
  }

  aux = aux.sort((a, b) => {
    if (a.fecha_create < b.fecha_create)
      return -1;
    if (a.fecha_create > b.fecha_create)
      return 1;
    return 0;
  });

  let stock_act = 0;
  let stock_actual = await Producto.findById(
    req.params.id
  ).select("cont_stock");
  stock_act = stock_actual.cont_stock;

  //COMPRA COMO PRIMER MES
  var data = {
    detalle: aux[0].detalle,
    fecha_create: aux[0].fecha_create,

    id_compra: aux[0].id_compra,
    cantidad_compra: aux[0].cantidad_compra,
    precio_compra: aux[0].precio_compra,
    valor_total_compra: aux[0].valor_total_compra,

    id_venta: "",
    cantidad_venta: "",
    precio_venta: "",
    valor_total_venta: "",

    cantidad_existencia: aux[0].cantidad_compra,
    precio_existencia: aux[0].precio_compra,
    valor_total_existencia: aux[0].valor_total_compra,
  }
  json_existencia.push(data);

  for (let i = 1; i < aux.length; i++) {
    
    if(aux[i].id_compra == ''){

      let valor_anterior = json_existencia[i-1].valor_total_existencia;
      let cantidad_anterior = json_existencia[i-1].cantidad_existencia;
     
      var data = {
        detalle: aux[i].detalle,
        fecha_create: aux[i].fecha_create,
    
        id_compra: "",
        cantidad_compra: "",
        precio_compra: "",
        valor_total_compra: "",
    
        id_venta: aux[i].id_venta,
        cantidad_venta: aux[i].cantidad_venta,
        precio_venta: aux[i].precio_venta,
        valor_total_venta: aux[i].valor_total_venta,
    
        cantidad_existencia: cantidad_anterior - aux[i].cantidad_venta,
        precio_existencia: Math.round(((valor_anterior - aux[i].valor_total_venta)/(cantidad_anterior - aux[i].cantidad_venta)) * 100) / 100,
        valor_total_existencia: valor_anterior - aux[i].valor_total_venta,
      }
      
    }else{

      let valor_anterior = json_existencia[i-1].valor_total_existencia;
      let cantidad_anterior = json_existencia[i-1].cantidad_existencia;
     
      var data = {
        detalle: aux[i].detalle,
        fecha_create: aux[i].fecha_create,
    
        id_compra: aux[i].id_compra,
        cantidad_compra: aux[i].cantidad_compra,
        precio_compra: aux[i].precio_compra,
        valor_total_compra: aux[i].valor_total_compra,
    
        id_venta: "",
        cantidad_venta: "",
        precio_venta: "",
        valor_total_venta: "",
    
        cantidad_existencia: cantidad_anterior + aux[i].cantidad_compra,
        precio_existencia: Math.round(((valor_anterior + aux[i].valor_total_compra)/(cantidad_anterior + aux[i].cantidad_compra)) * 100) / 100,
        valor_total_existencia: valor_anterior + aux[i].valor_total_compra,
      }
    }
    json_existencia.push(data);
  }

  console.log(json_existencia)

  
  if (!json_existencia) return res.status(500).json({ success: false });
  res.status(200).send(json_existencia);
});

router.get(`/ventas/:id`, async (req, res) => {
  /*const ventaLista = await Order_producto.find({})
    .populate("producto", ["nombre", "precio"] )
    .sort({ fecha_create: -1 });

  const ventaListaFiltro1 = ventaLista.filter((venta) => 
      venta.producto._id == req.params.id
  );


  if (!ventaListaFiltro1) return res.status(500).json({ success: false });

  res.status(200).send(ventaListaFiltro1);*/

  const pedido = await Pedido.find({})
    .populate("usuario", "nombre")
    .populate({
      path: "order_prods",
      populate: {
        path: "producto",
        select: ["nombre", "precio"],
      },
    })
    .select(["order_prods", "producto", "usuario", "fecha_pedido"]);

  const ventaListaFiltro1 = pedido.filter(
    (venta) => venta.order_prods[0].producto._id == req.params.id
  );

  if (!ventaListaFiltro1) return res.status(500).json({ success: false });

  res.status(200).send(ventaListaFiltro1);
});

module.exports = router;
