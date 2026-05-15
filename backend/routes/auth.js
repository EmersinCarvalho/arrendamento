const express = require("express");
const router = express.Router();
const passport = require("../config/passport");
const jwt = require("jsonwebtoken");
const db = require("../config/db");

// Middleware para verificar JWT
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

// GET /api/auth/google — redireciona para Google
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// GET /api/auth/google/callback — Google redireciona aqui depois do login
router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL}/login?erro=auth`,
  }),
  (req, res) => {
    const u = req.user;
    const token = jwt.sign(
      {
        id: u.id,
        nome: u.nome,
        email: u.email,
        perfil: u.perfil,
        foto_url: u.foto_url,
        isNew: u.isNew || false,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.redirect(
      `${process.env.FRONTEND_URL}/auth/callback?token=${token}`
    );
  }
);

// PUT /api/auth/perfil — atualiza o perfil do utilizador autenticado
router.put("/perfil", verificarToken, async (req, res) => {
  const { perfil } = req.body;

  if (!["inquilino", "senhorio"].includes(perfil)) {
    return res.status(400).json({ erro: "Perfil inválido" });
  }

  try {
    await db.execute(
      "UPDATE utilizadores SET perfil = ? WHERE id = ?",
      [perfil, req.utilizador.id]
    );

    // Re-emite token com o novo perfil
    const [rows] = await db.execute(
      "SELECT id, nome, email, perfil, foto_url FROM utilizadores WHERE id = ?",
      [req.utilizador.id]
    );
    const u = rows[0];
    const novoToken = jwt.sign(
      { id: u.id, nome: u.nome, email: u.email, perfil: u.perfil, foto_url: u.foto_url, isNew: false },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ token: novoToken });
  } catch (err) {
    console.error("Erro em PUT /api/auth/perfil:", err.message);
    res.status(500).json({ erro: "Erro ao atualizar perfil" });
  }
});

// GET /api/auth/me — dados do utilizador autenticado
router.get("/me", verificarToken, async (req, res) => {
  try {
    const [rows] = await db.execute(
      "SELECT id, nome, email, perfil, foto_url, criado_em FROM utilizadores WHERE id = ?",
      [req.utilizador.id]
    );
    if (rows.length === 0) return res.status(404).json({ erro: "Utilizador não encontrado" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ erro: "Erro ao carregar utilizador" });
  }
});

module.exports = router;
