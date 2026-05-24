const express = require("express");
const router = express.Router();
const db = require("../config/db");
const verificarToken = require("../middleware/auth");

// ─────────────────────────────────────────────────────────────────
// CURRÍCULO IMOBILIÁRIO
// ─────────────────────────────────────────────────────────────────

// GET /api/candidaturas/curriculo — obter o meu currículo
router.get("/curriculo", verificarToken, async (req, res) => {
  try {
    const [rows] = await db.execute(
      "SELECT * FROM curriculo_imobiliario WHERE utilizador_id = ?",
      [req.utilizador.id]
    );
    res.json(rows[0] || null);
  } catch (err) {
    console.error("Erro em GET /api/candidaturas/curriculo:", err.message);
    res.status(500).json({ erro: "Erro ao carregar currículo" });
  }
});

// PUT /api/candidaturas/curriculo — criar/atualizar o meu currículo
router.put("/curriculo", verificarToken, async (req, res) => {
  if (req.utilizador.perfil !== "inquilino") {
    return res.status(403).json({ erro: "Apenas inquilinos podem ter currículo imobiliário" });
  }

  const {
    situacao_profissional,
    tipo_contrato,
    profissao,
    rendimento_mensal,
    num_pessoas,
    tem_animais,
    duracao_pretendida,
    referencias,
    sobre_mim,
  } = req.body;

  try {
    await db.execute(
      `INSERT INTO curriculo_imobiliario
         (utilizador_id, situacao_profissional, tipo_contrato, profissao, rendimento_mensal,
          num_pessoas, tem_animais, duracao_pretendida, referencias, sobre_mim)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         situacao_profissional = VALUES(situacao_profissional),
         tipo_contrato         = VALUES(tipo_contrato),
         profissao             = VALUES(profissao),
         rendimento_mensal     = VALUES(rendimento_mensal),
         num_pessoas           = VALUES(num_pessoas),
         tem_animais           = VALUES(tem_animais),
         duracao_pretendida    = VALUES(duracao_pretendida),
         referencias           = VALUES(referencias),
         sobre_mim             = VALUES(sobre_mim),
         atualizado_em         = CURRENT_TIMESTAMP`,
      [
        req.utilizador.id,
        situacao_profissional || null,
        tipo_contrato || null,
        profissao || null,
        rendimento_mensal || null,
        num_pessoas || null,
        tem_animais ? 1 : 0,
        duracao_pretendida || null,
        referencias || null,
        sobre_mim || null,
      ]
    );
    res.json({ mensagem: "Currículo guardado com sucesso" });
  } catch (err) {
    console.error("Erro em PUT /api/candidaturas/curriculo:", err.message);
    res.status(500).json({ erro: "Erro ao guardar currículo" });
  }
});

// ─────────────────────────────────────────────────────────────────
// CANDIDATURAS / INTERESSE
// ─────────────────────────────────────────────────────────────────

// GET /api/candidaturas/imovel/:id/estado — verificar se já manifestei interesse
router.get("/imovel/:id/estado", verificarToken, async (req, res) => {
  try {
    const [rows] = await db.execute(
      "SELECT id FROM candidaturas WHERE inquilino_id = ? AND imovel_id = ?",
      [req.utilizador.id, req.params.id]
    );
    res.json({ jaEnviou: rows.length > 0 });
  } catch (err) {
    res.status(500).json({ erro: "Erro ao verificar candidatura" });
  }
});

// POST /api/candidaturas/imovel/:id — manifestar interesse num imóvel
router.post("/imovel/:id", verificarToken, async (req, res) => {
  if (req.utilizador.perfil !== "inquilino") {
    return res.status(403).json({ erro: "Apenas inquilinos podem manifestar interesse" });
  }

  const imovelId = req.params.id;

  try {
    // Verificar se o imóvel existe e obter o dono
    const [imoveis] = await db.execute(
      "SELECT utilizador_id FROM imoveis WHERE id = ? AND disponivel = 1",
      [imovelId]
    );
    if (imoveis.length === 0) {
      return res.status(404).json({ erro: "Imóvel não encontrado" });
    }
    if (imoveis[0].utilizador_id === req.utilizador.id) {
      return res.status(400).json({ erro: "Não pode manifestar interesse no seu próprio imóvel" });
    }

    // Verificar se o inquilino tem currículo preenchido
    const [curriculo] = await db.execute(
      "SELECT id FROM curriculo_imobiliario WHERE utilizador_id = ?",
      [req.utilizador.id]
    );
    if (curriculo.length === 0) {
      return res.status(422).json({ erro: "curriculo_em_falta" });
    }

    // Inserir candidatura (ignorar se já existir)
    await db.execute(
      `INSERT IGNORE INTO candidaturas (inquilino_id, imovel_id) VALUES (?, ?)`,
      [req.utilizador.id, imovelId]
    );

    res.json({ mensagem: "Interesse enviado com sucesso" });
  } catch (err) {
    console.error("Erro em POST /api/candidaturas/imovel/:id:", err.message);
    res.status(500).json({ erro: "Erro ao enviar interesse" });
  }
});

// GET /api/candidaturas/recebidas — senhorio vê quem manifestou interesse nos seus imóveis
router.get("/recebidas", verificarToken, async (req, res) => {
  if (req.utilizador.perfil !== "senhorio") {
    return res.status(403).json({ erro: "Apenas senhorios podem ver candidaturas recebidas" });
  }
  try {
    const [rows] = await db.execute(
      `SELECT
         c.id,
         c.lida,
         c.criado_em,
         i.id         AS imovel_id,
         i.titulo     AS imovel_titulo,
         i.tipologia,
         i.preco,
         u.id         AS inquilino_id,
         u.nome       AS inquilino_nome,
         u.email      AS inquilino_email,
         u.foto_url   AS inquilino_foto,
         u.telefone   AS inquilino_telefone,
         ci.situacao_profissional,
         ci.tipo_contrato,
         ci.profissao,
         ci.rendimento_mensal,
         ci.num_pessoas,
         ci.tem_animais,
         ci.duracao_pretendida,
         ci.referencias,
         ci.sobre_mim
       FROM candidaturas c
       JOIN imoveis i               ON i.id = c.imovel_id
       JOIN utilizadores u          ON u.id = c.inquilino_id
       LEFT JOIN curriculo_imobiliario ci ON ci.utilizador_id = c.inquilino_id
       WHERE i.utilizador_id = ?
       ORDER BY c.lida ASC, c.criado_em DESC`,
      [req.utilizador.id]
    );
    res.json(rows);
  } catch (err) {
    console.error("Erro em GET /api/candidaturas/recebidas:", err.message);
    res.status(500).json({ erro: "Erro ao carregar candidaturas" });
  }
});

// GET /api/candidaturas/nao-lidas — contagem de propostas não lidas para o senhorio
router.get("/nao-lidas", verificarToken, async (req, res) => {
  if (req.utilizador.perfil !== "senhorio") {
    return res.json({ total: 0 });
  }
  try {
    const [rows] = await db.execute(
      `SELECT COUNT(*) AS total
       FROM candidaturas c
       JOIN imoveis i ON i.id = c.imovel_id
       WHERE i.utilizador_id = ? AND c.lida = 0`,
      [req.utilizador.id]
    );
    res.json({ total: rows[0].total });
  } catch (err) {
    res.status(500).json({ total: 0 });
  }
});

// PATCH /api/candidaturas/:id/lida — marcar candidatura como lida
router.patch("/:id/lida", verificarToken, async (req, res) => {
  if (req.utilizador.perfil !== "senhorio") {
    return res.status(403).json({ erro: "Acesso negado" });
  }
  try {
    await db.execute(
      `UPDATE candidaturas c
       JOIN imoveis i ON i.id = c.imovel_id
       SET c.lida = 1
       WHERE c.id = ? AND i.utilizador_id = ?`,
      [req.params.id, req.utilizador.id]
    );
    res.json({ mensagem: "Candidatura marcada como lida" });
  } catch (err) {
    res.status(500).json({ erro: "Erro ao atualizar candidatura" });
  }
});

module.exports = router;
