const express = require("express");
const router = express.Router();
const Pedido = require("../models/orders");
const Producto = require("../models/productos");
const Prod_pedido = require("../models/order-producto");

const stripe = require("stripe")(
  "sk_test_51JbeGwApvJeofVU9XHb3lleEegz4hnsj4Q0AiQBk8OSI3e9hZdTx6LQQUfffJ3T16EGBFTjKPGdho2knotqngukT00XDkZ1lSI"
);
var _ = require("underscore");

router.get(`/`, async (req, res) => {
  const orderLista = await Pedido.find()
    .populate("usuario", "nombre")
    .sort({ fecha_pedido: -1 });

  if (!orderLista) return res.status(500).json({ success: false });

  res.status(200).send(orderLista);
});

router.get(`/:id`, async (req, res) => {
  const pedido = await Pedido.findById(req.params.id)
    .populate("usuario", "nombre")
    .populate({
      path: "order_prods",
      populate: {
        path: "producto",
        populate: "categoria",
      },
    });

  if (!pedido) return res.status(500).json({ success: false });

  res.status(200).send(pedido);
});

router.put(`/preventaMenos/`, async (req, res) => {
  req.body.order_prods.map(async (order_producto) => {
    const producto = await Producto.findByIdAndUpdate(
      order_producto.producto,
      { $inc: { cont_stock: -order_producto.cantidad } },
      { new: true }
    );

    if (!producto) return res.status(500).send("Stock no actualizado");
  });

  return res.status(200).json({
    success: true,
    message: "Verificado correctamente",
  });
});

router.put(`/preventaRecuperar/`, async (req, res) => {
  req.body.order_prods.map(async (order_producto) => {
    const producto = await Producto.findByIdAndUpdate(
      order_producto.producto,
      { $inc: { cont_stock: order_producto.cantidad } },
      { new: true }
    );

    if (!producto) return res.status(500).send("Stock no actualizado");
  });

  return res.status(200).json({
    success: true,
    message: "Verificado correctamente",
  });
});

router.post(`/`, async (req, res) => {
  const order_prod_id = Promise.all(
    req.body.order_prods.map(async (order_producto) => {
      let newOrder_prod = new Prod_pedido({
        cantidad: order_producto.cantidad,
        producto: order_producto.producto,
      });

      newOrder_prod = await newOrder_prod.save();

      let stock_act = 0,
        stock_nuevo = 0;

      let stock_actual = await Producto.findById(
        order_producto.producto
      ).select("cont_stock");

      stock_act = stock_actual.cont_stock;

      console.log(stock_actual);

      stock_nuevo = stock_act - order_producto.cantidad;

      console.log("stock_nuevo " + stock_nuevo);

      let compra2 = await Producto.findByIdAndUpdate(
        order_producto.producto,
        {
          cont_stock: stock_nuevo,
        },
        { new: true }
      );

      if (!compra2) {
        return res.status(404).send("Pedido no registrado");
      }

      return newOrder_prod._id;
    })
  );

  const order_prod_id_resolv = await order_prod_id;

  console.log(order_prod_id_resolv);

  const totalPrecios = await Promise.all(
    order_prod_id_resolv.map(async (order_productoID) => {
      let order_producto = await Prod_pedido.findById(
        order_productoID
      ).populate("producto", "precio");

      let total_prodcto =
        order_producto.producto.precio * order_producto.cantidad;

      return total_prodcto;
    })
  );

  const totalPrecio = totalPrecios.reduce((a, b) => a + b, 0);

  let pedido = new Pedido({
    order_prods: order_prod_id_resolv,
    envio_direcc1: req.body.envio_direcc1,
    envio_direcc2: req.body.envio_direcc2,
    ciudad: req.body.ciudad,
    cod_postal: req.body.cod_postal,
    pais: req.body.pais,
    telef: req.body.telef,
    estado: req.body.estado,
    totalPrecio: totalPrecio,
    usuario: req.body.usuario,
  });

  pedido = await pedido.save();

  if (!pedido) return res.status(400).send("Pedido no creado");

  res.send(pedido);
});

router.put(`/:id`, async (req, res) => {
  const pedido = await Pedido.findByIdAndUpdate(
    req.params.id,
    {
      estado: req.body.estado,
    },
    { new: true }
  );

  console.log(req.body.estado);
  if (req.body.estado == 4) {
    var pedido_producto = req.body.pedido;

    for (let i in pedido_producto.order_prods) {
      console.log(pedido_producto.order_prods[i].producto);

      const producto_xd = await Producto.findByIdAndUpdate(
        pedido_producto.order_prods[i].producto._id,
        {
          $inc: {
            cont_stock: pedido_producto.order_prods[i].producto.cont_stock,
          },
        },
        { new: true }
      );

      if (!producto_xd)
        return res
          .status(500)
          .json({ success: false, message: "No se actualizo" });
    }
  }

  if (!pedido)
    return res.status(500).json({ success: false, message: "No se actualizo" });

  res.status(200).send(pedido);
});

router.delete(`/:id`, (req, res) => {
  /*Pedido.findByIdAndUpdate(
    req.params.id,
    {
      flgElimProd: true
    },
    { new: true }
  ).then(async (pedido) => {
      if (pedido) {
        await pedido.order_prods.map(async (order_prod) => {
          await Prod_pedido.findByIdAndRemove(order_prod);
        });
        return res.status(200).json({
          success: true,
          message: "Eliminado correctamente",
        });
      } else {
        return res.status(404).json({
          success: false,
          message: "Pedido no encontrada",
        });
      }
    })
    .catch((error) => {
      return res.status(500).json({
        success: false,
        error: err,
      });
    });*/
});

router.get(`/get/ventaTotales`, async (req, res) => {
  const total_venta = await Pedido.aggregate([
    { $group: { _id: null, total_ventas: { $sum: "$totalPrecio" } } },
  ]);

  if (!total_venta)
    return res.status(500).json({ success: false, message: "No hubo ventas" });

  res.send({ total_ventas: total_venta.pop().total_ventas });
});

router.get(`/get/reporte`, async (req, res) => {
  const orderLista = await Pedido.find({
    estado: 3
    })
    .populate("usuario", "nombre")
    .populate({
      path: "order_prods",
      populate: {
        path: "producto",
        populate: "categoria",
      },
    });


  if (!orderLista) return res.status(500).json({ success: false });

  res.status(200).send(orderLista);
});

router.get(`/get/cant`, async (req, res) => {
  const cantPedido = await Pedido.countDocuments((cant) => cant);

  if (!cantPedido)
    return res
      .status(500)
      .json({ success: false, message: "Ningun pedido ha sido encontrado" });

  res.send({
    cantPedido: cantPedido,
  });
});

router.get(`/get/pedido/:id`, async (req, res) => {
  const pedido_usuario = await Pedido.find({ usuario: req.params.id })
    .populate({
      path: "order_prods",
      populate: {
        path: "producto",
        populate: "categoria",
      },
    })
    .sort({ fecha_pedido: -1 });

  if (!pedido_usuario) return res.status(500).json({ success: false });

  res.status(200).send(pedido_usuario);
});

router.get(`/get/review/:id`, async (req, res) => {
  const ComentarioList = await Pedido.find({
    usuario: req.params.id,
  })
    .distinct("order_prods")
    .populate({
      path: "order_prods",
      populate: {
        path: "producto",
        select: ["_id", "nombre"],
      },
    })
    .populate("usuario", ["_id", "nombre"]);

  //ComentarioList

  if (!ComentarioList) return res.status(500).json({ success: false });

  res.status(200).send(ComentarioList);
});

router.post("/create-checkout-session", async (req, res) => {
  const itemPedido = req.body;

  if (!itemPedido) {
    return res
      .status(400)
      .send("checkout session cannot be created - check the order items");
  }
  const lineItems = await Promise.all(
    itemPedido.map(async (itempedido) => {
      const producto = await Producto.findById(itempedido.producto);
      return {
        price_data: {
          currency: "usd",
          product_data: {
            name: producto.nombre,
          },
          unit_amount: producto.precio * 100,
        },
        quantity: itempedido.quantity,
      };
    })
  );
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: lineItems,
    mode: "payment",
    success_url: "http://localhost:4200/success",
    cancel_url: "http://localhost:4200/error",
  });

  res.json({ id: session.id });
});

router.get(`/reporte_diario/:dia/:mes/:anio`, async (req, res) => {

  var dia = req.params.dia
  var mes = req.params.mes
  var anio = req.params.anio

  const orderLista = await Pedido.find({
    estado: 3
  })
  .populate("usuario", "nombre")
  .populate({
    path: "order_prods",
    populate: {
      path: "producto",
      populate: "categoria",
    },
  });
  const ventaListaFiltro = orderLista.filter(
    (venta) => venta.fecha_pedido.getDate()+1 == dia && venta.fecha_pedido.getMonth()+1 == mes && venta.fecha_pedido.getFullYear() == anio
  ); 
  if (!ventaListaFiltro) return res.status(500).json({ success: false });

res.status(200).send(ventaListaFiltro);

});

router.get(`/reporte_mes/:mes/:anio`, async (req, res) => {

  var mes = req.params.mes
  var anio = req.params.anio
  
  const orderLista = await Pedido.find({
    estado: 3
  })
  .populate("usuario", "nombre")
  .populate({
    path: "order_prods",
    populate: {
      path: "producto",
      populate: "categoria",
    },
  });

  const ventaListaFiltro = orderLista.filter(
    (venta) => venta.fecha_pedido.getMonth()+1 == mes && venta.fecha_pedido.getFullYear() == anio
  ); 
  if (!ventaListaFiltro) return res.status(500).json({ success: false });

res.status(200).send(ventaListaFiltro);

});


router.get(`/reporte_anio/:anio`, async (req, res) => {

  var anio = req.params.anio
  
  const orderLista = await Pedido.find({
    estado: 3
  })
  .populate("usuario", "nombre")
  .populate({
    path: "order_prods",
    populate: {
      path: "producto",
      populate: "categoria",
    },
  });
  const ventaListaFiltro = orderLista.filter(
    (venta) => venta.fecha_pedido.getFullYear() == anio
  ); 
  if (!ventaListaFiltro) return res.status(500).json({ success: false });

res.status(200).send(ventaListaFiltro);

});

module.exports = router;
