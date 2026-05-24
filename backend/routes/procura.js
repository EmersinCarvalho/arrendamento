const express = require("express");
const router = express.Router();
const db = require("../config/db");
const verificarToken = require("../middleware/auth");

// GET /api/procura/perfil — perfil de procura do utilizador
router.get("/perfil", verificarToken, async (req, res) => {
  try {
    const [rows] = await db.execute(
      "SELECT * FROM perfil_procura WHERE utilizador_id = ?",
      [req.utilizador.id]
    );
    const perfil = rows[0];
    if (perfil) {
      try { perfil.prioridades = JSON.parse(perfil.prioridades || "[]"); } catch { perfil.prioridades = []; }
      try { perfil.tipo_imovel = JSON.parse(perfil.tipo_imovel || "[]"); } catch { perfil.tipo_imovel = []; }
      if (!Array.isArray(perfil.tipo_imovel)) perfil.tipo_imovel = perfil.tipo_imovel ? [perfil.tipo_imovel] : [];
    }
    res.json(perfil || null);
  } catch (err) {
    res.status(500).json({ erro: "Erro ao carregar perfil de procura" });
  }
});

// POST /api/procura/perfil — criar ou atualizar perfil de procura
router.post("/perfil", verificarToken, async (req, res) => {
  const {
    objetivo, tipo_imovel, cidade, tipologia,
    preco_max, quartos_min,
    aceita_pets, mobiliado, despesas_incluidas, prioridades,
  } = req.body;

  try {
    await db.execute(
      `INSERT INTO perfil_procura
         (utilizador_id, objetivo, tipo_imovel, cidade, tipologia,
          preco_max, quartos_min, aceita_pets, mobiliado, despesas_incluidas, prioridades)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         objetivo = VALUES(objetivo),
         tipo_imovel = VALUES(tipo_imovel),
         cidade = VALUES(cidade),
         tipologia = VALUES(tipologia),
         preco_max = VALUES(preco_max),
         quartos_min = VALUES(quartos_min),
         aceita_pets = VALUES(aceita_pets),
         mobiliado = VALUES(mobiliado),
         despesas_incluidas = VALUES(despesas_incluidas),
         prioridades = VALUES(prioridades),
         atualizado_em = CURRENT_TIMESTAMP`,
      [
        req.utilizador.id,
        objetivo || "arrendar",
        JSON.stringify(Array.isArray(tipo_imovel) ? tipo_imovel : (tipo_imovel ? [tipo_imovel] : [])),
        cidade || null,
        tipologia || null,
        preco_max || 2000,
        quartos_min || 0,
        aceita_pets ? 1 : 0,
        mobiliado ? 1 : 0,
        despesas_incluidas ? 1 : 0,
        JSON.stringify(prioridades || []),
      ]
    );

    const [rows] = await db.execute(
      "SELECT * FROM perfil_procura WHERE utilizador_id = ?",
      [req.utilizador.id]
    );
    const perfilAtualizado = rows[0];
    if (perfilAtualizado) {
      try { perfilAtualizado.prioridades = JSON.parse(perfilAtualizado.prioridades || "[]"); } catch { perfilAtualizado.prioridades = []; }
      try { perfilAtualizado.tipo_imovel = JSON.parse(perfilAtualizado.tipo_imovel || "[]"); } catch { perfilAtualizado.tipo_imovel = []; }
      if (!Array.isArray(perfilAtualizado.tipo_imovel)) perfilAtualizado.tipo_imovel = perfilAtualizado.tipo_imovel ? [perfilAtualizado.tipo_imovel] : [];
    }
    res.json(perfilAtualizado);
  } catch (err) {
    console.error("Erro em POST /api/procura/perfil:", err.message);
    res.status(500).json({ erro: "Erro ao guardar perfil" });
  }
});

// GET /api/procura/imoveis — imóveis disponíveis para swipe
router.get("/imoveis", verificarToken, async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT * FROM imoveis WHERE disponivel = 1 ORDER BY criado_em DESC LIMIT 100`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ erro: "Erro ao carregar imóveis" });
  }
});

module.exports = router;
