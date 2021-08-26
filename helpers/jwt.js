const expressJwt = require("express-jwt");

function authJwt() {
  const secret = process.env.secret;
  const api = process.env.API_URL;

  return expressJwt({
    secret,
    algorithms: ["HS256"],
    isRevoked: isRevoked,
  }).unless({
    path: [
       { url: /\/public\/uploads(.*)/, methods: ["GET", "OPTIONS"] },
      { url: /\/api\/v1\/productos(.*)/, methods: ["GET", "OPTIONS"] },
      { url: /\/api\/v1\/categorias(.*)/, methods: ["GET", "OPTIONS"] },
      { url: /\/api\/v1\/orders(.*)/, methods: ['GET', 'OPTIONS', 'POST'] },
      `${api}/usuarios/login`,
      `${api}/usuarios/registro`,
    ],
  });
}

async function isRevoked(req, payload, done) {
  if (!payload.admi) return done(null, true);

  done();
}

module.exports = authJwt;
