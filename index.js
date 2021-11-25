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
const kardexRouter = require("./routers/kardex");

app.use(`${api}/productos`, productosRouter);
app.use(`${api}/categorias`, categoriasRouter);
app.use(`${api}/usuarios`, usuariosRouter);
app.use(`${api}/orders`, ordersRouter);
app.use(`${api}/compras`, comprasRouter);
app.use(`${api}/proveedor`, proveedorRouter);
app.use(`${api}/kardex`, kardexRouter);

//Database
mongoose
  .connect(process.env.CONNECTION_URL, {
    useNewUrlParse: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
    useCreateIndex: true,
    dbName: process.env.DBNAME,
    //dbName: process.env.DBNAME2,
  })
  .then(() => {
    console.log("Database success");
  })
  .catch(() => {
    console.log(error);
  });


  const PORT = process.env.PORT || 3000;

//Server
app.listen(PORT, () => {
  console.log(api);
  console.log("Starting... 3000   ");
});
