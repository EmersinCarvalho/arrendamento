const jwt = require("jsonwebtoken");

function verificarToken(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Bearer ")) {
    return res.status(401).json({ erro: "Token necessário" });
  }
  try {
    req.utilizador = jwt.verify(auth.slice(7), process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ erro: "Token inválido ou expirado" });
  }
}

module.exports = verificarToken;
