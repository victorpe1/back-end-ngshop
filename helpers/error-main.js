function errorHandler(err, req, res, next) {
  if (err.name === "UnauthorizedError") {
      //jwt error
    return res
      .status(401)
      .json({ message: "El usuario no tiene autorizacion" });
  }

  if (err.name === "ValidationError") {
      //validacion error
    return res.status(401).json({ message: err });
  }

  //default 500 server error
  return res.status(500).json(err);
}

module.exports = errorHandler;