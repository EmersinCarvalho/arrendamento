const express = require("express");
const router = express.Router();
const db = require("../config/db");
const verificarToken = require("../middleware/auth");

// GET /api/avaliacoes/utilizador/:id — lista avaliações de um anunciante (público)
router.get("/utilizador/:id", async (req, res) => {
  try {
    const avaliado_id = Number(req.params.id);

    const [avaliacoes] = await db.execute(
      `SELECT a.id, a.estrelas, a.comentario, a.criado_em,
              u.id AS avaliador_id, u.nome AS avaliador_nome, u.foto_url AS avaliador_foto
       FROM avaliacoes a
       JOIN utilizadores u ON u.id = a.avaliador_id
       WHERE a.avaliado_id = ?
       ORDER BY a.criado_em DESC`,
      [avaliado_id]
    );

    const [stats] = await db.execute(
      `SELECT COUNT(*) AS total, ROUND(AVG(estrelas), 1) AS media,
              SUM(estrelas = 5) AS c5, SUM(estrelas = 4) AS c4,
              SUM(estrelas = 3) AS c3, SUM(estrelas = 2) AS c2,
              SUM(estrelas = 1) AS c1
       FROM avaliacoes WHERE avaliado_id = ?`,
      [avaliado_id]
    );

    const [anunciante] = await db.execute(
      "SELECT id, nome, email, foto_url, telefone, bio, criado_em FROM utilizadores WHERE id = ?",
      [avaliado_id]
    );

    if (anunciante.length === 0) {
      return res.status(404).json({ erro: "Utilizador não encontrado" });
    }

    res.json({
      anunciante: anunciante[0],
      stats: stats[0],
      avaliacoes,
    });
  } catch (err) {
    console.error("Erro em GET /api/avaliacoes/utilizador/:id:", err.message);
    res.status(500).json({ erro: "Erro ao carregar avaliações" });
  }
});

// POST /api/avaliacoes/utilizador/:id — submeter ou atualizar avaliação (requer auth)
router.post("/utilizador/:id", verificarToken, async (req, res) => {
  const avaliado_id = Number(req.params.id);
  const avaliador_id = req.utilizador.id;

  if (avaliado_id === avaliador_id) {
    return res.status(400).json({ erro: "Não pode avaliar-se a si próprio" });
  }

  const { estrelas, comentario } = req.body;
  if (!estrelas || estrelas < 1 || estrelas > 5) {
    return res.status(400).json({ erro: "Classificação deve ser entre 1 e 5 estrelas" });
  }

  try {
    // Verifica se o avaliado existe e é senhorio
    const [utilizador] = await db.execute(
      "SELECT id FROM utilizadores WHERE id = ?",
      [avaliado_id]
    );
    if (utilizador.length === 0) {
      return res.status(404).json({ erro: "Anunciante não encontrado" });
    }

    // INSERT ... ON DUPLICATE KEY UPDATE para permitir editar a própria avaliação
    await db.execute(
      `INSERT INTO avaliacoes (avaliador_id, avaliado_id, estrelas, comentario)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE estrelas = VALUES(estrelas), comentario = VALUES(comentario)`,
      [avaliador_id, avaliado_id, Number(estrelas), comentario?.trim() || null]
    );

    res.json({ mensagem: "Avaliação submetida com sucesso" });
  } catch (err) {
    console.error("Erro em POST /api/avaliacoes/utilizador/:id:", err.message);
    res.status(500).json({ erro: "Erro ao submeter avaliação" });
  }
});

// DELETE /api/avaliacoes/utilizador/:id — eliminar a própria avaliação (requer auth)
router.delete("/utilizador/:id", verificarToken, async (req, res) => {
  try {
    await db.execute(
      "DELETE FROM avaliacoes WHERE avaliador_id = ? AND avaliado_id = ?",
      [req.utilizador.id, Number(req.params.id)]
    );
    res.json({ mensagem: "Avaliação eliminada" });
  } catch (err) {
    console.error("Erro em DELETE /api/avaliacoes/utilizador/:id:", err.message);
    res.status(500).json({ erro: "Erro ao eliminar avaliação" });
  }
});

module.exports = router;
