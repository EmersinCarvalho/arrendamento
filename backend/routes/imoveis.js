const express = require("express");
const router = express.Router();
const db = require("../config/db");

// GET /api/imoveis - lista todos os imóveis (com filtros opcionais)
router.get("/", async (req, res) => {
  try {
    const { cidade, tipologia } = req.query;

    let query = "SELECT * FROM imoveis WHERE disponivel = 1";
    const params = [];

    if (cidade) {
      query += " AND cidade = ?";
      params.push(cidade);
    }

    if (tipologia) {
      query += " AND tipologia = ?";
      params.push(tipologia);
    }

    query += " ORDER BY criado_em DESC";

    const [rows] = await db.execute(query, params);
    res.json(rows);
  } catch (err) {
    console.error("Erro em GET /api/imoveis:", err.message);
    res.status(500).json({ erro: "Erro ao carregar imóveis" });
  }
});

// GET /api/imoveis/:id - detalhes de um imóvel
router.get("/:id", async (req, res) => {
  try {
    const [rows] = await db.execute(
      "SELECT * FROM imoveis WHERE id = ?",
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ erro: "Imóvel não encontrado" });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error("Erro em GET /api/imoveis/:id:", err.message);
    res.status(500).json({ erro: "Erro ao carregar imóvel" });
  }
});

module.exports = router;
