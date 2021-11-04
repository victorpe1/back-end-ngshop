const express = require("express");
const app = express();
const morgan = require("morgan");
const mongoose = require("mongoose");
const cors = require("cors");
const authJwt = require("./helpers/jwt");
require("dotenv/config");
const errorHandler = require("./helpers/error-main");

app.use(cors());
app.options("*", cors());

//middleware
app.use(express.json());
app.use(morgan("tiny"));
app.use(authJwt());
app.use("/public/uploads", express.static(__dirname + "/public/uploads"));
app.use(errorHandler);

const api = process.env.API_URL;

//Router

const categoriasRouter = require("./routers/categorias.js");
const productosRouter = require("./routers/productos");
const usuariosRouter = require("./routers/usuarios");
const ordersRouter = require("./routers/orders");
const comprasRouter = require("./routers/compra");
const proveedorRouter = require("./routers/proveedor");

app.use(`${api}/productos`, productosRouter);
app.use(`${api}/categorias`, categoriasRouter);
app.use(`${api}/usuarios`, usuariosRouter);
app.use(`${api}/orders`, ordersRouter);
app.use(`${api}/compras`, comprasRouter);
app.use(`${api}/proveedor`, proveedorRouter);

//Database
mongoose
  .connect(process.env.CONNECTION_URL, {
    useNewUrlParse: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
    dbName: "e-commerce",
    //dbName: "miglazedb",
  })
  .then(() => {
    console.log("Database success");
  })
  .catch(() => {
    console.log(error);
  });

//Server
app.listen(3000, () => {
  console.log(api);
  console.log("Starting... 3000   ");
});
