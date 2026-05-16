const express = require("express");
const router = express.Router();
const db = require("../config/db");
const verificarToken = require("../middleware/auth");

// Todas as rotas requerem autenticação
router.use(verificarToken);

// GET /api/favoritos - lista os IDs dos imóveis favoritos do utilizador
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.execute(
      "SELECT imovel_id FROM favoritos WHERE utilizador_id = ?",
      [req.utilizador.id]
    );
    res.json(rows.map((r) => r.imovel_id));
  } catch (err) {
    console.error("Erro em GET /api/favoritos:", err.message);
    res.status(500).json({ erro: "Erro ao carregar favoritos" });
  }
});

// GET /api/favoritos/imoveis - devolve os imóveis completos favoritos do utilizador
router.get("/imoveis", async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT i.*
       FROM imoveis i
       INNER JOIN favoritos f ON f.imovel_id = i.id
       WHERE f.utilizador_id = ?
       ORDER BY f.criado_em DESC`,
      [req.utilizador.id]
    );
    res.json(rows);
  } catch (err) {
    console.error("Erro em GET /api/favoritos/imoveis:", err.message);
    res.status(500).json({ erro: "Erro ao carregar imóveis favoritos" });
  }
});

// POST /api/favoritos/:imovelId - adicionar favorito
router.post("/:imovelId", async (req, res) => {
  try {
    await db.execute(
      "INSERT IGNORE INTO favoritos (utilizador_id, imovel_id) VALUES (?, ?)",
      [req.utilizador.id, req.params.imovelId]
    );
    res.status(201).json({ mensagem: "Adicionado aos favoritos" });
  } catch (err) {
    console.error("Erro em POST /api/favoritos:", err.message);
    res.status(500).json({ erro: "Erro ao adicionar favorito" });
  }
});

// DELETE /api/favoritos/:imovelId - remover favorito
router.delete("/:imovelId", async (req, res) => {
  try {
    await db.execute(
      "DELETE FROM favoritos WHERE utilizador_id = ? AND imovel_id = ?",
      [req.utilizador.id, req.params.imovelId]
    );
    res.json({ mensagem: "Removido dos favoritos" });
  } catch (err) {
    console.error("Erro em DELETE /api/favoritos:", err.message);
    res.status(500).json({ erro: "Erro ao remover favorito" });
  }
});

module.exports = router;
