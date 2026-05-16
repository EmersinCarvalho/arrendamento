const express = require("express");
const router = express.Router();
const db = require("../config/db");
const verificarToken = require("../middleware/auth");

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

// GET /api/imoveis/meus - lista os imóveis do senhorio autenticado
// (deve ficar ANTES de /:id para não ser capturado como parâmetro)
router.get("/meus", verificarToken, async (req, res) => {
  try {
    const [rows] = await db.execute(
      "SELECT * FROM imoveis WHERE utilizador_id = ? ORDER BY criado_em DESC",
      [req.utilizador.id]
    );
    res.json(rows);
  } catch (err) {
    console.error("Erro em GET /api/imoveis/meus:", err.message);
    res.status(500).json({ erro: "Erro ao carregar os seus imóveis" });
  }
});

// GET /api/imoveis/:id - detalhes de um imóvel (inclui info do senhorio)
router.get("/:id", async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT i.*,
              u.nome        AS senhorio_nome,
              u.foto_url    AS senhorio_foto,
              u.criado_em   AS senhorio_membro_desde
       FROM imoveis i
       LEFT JOIN utilizadores u ON u.id = i.utilizador_id
       WHERE i.id = ?`,
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

// POST /api/imoveis - publicar novo imóvel (apenas senhorios)
router.post("/", verificarToken, async (req, res) => {
  if (req.utilizador.perfil !== "senhorio") {
    return res.status(403).json({ erro: "Apenas senhorios podem publicar imóveis" });
  }

  const {
    titulo, cidade, tipologia, preco, descricao,
    quartos, tipo_imovel, aceita_pets, mobiliado,
    despesas_incluidas, foto,
    // novos campos
    area, casas_banho, varanda, garagem, estado,
    armarios_embutidos, orientacao, cozinha_equipada,
    aquecimento, tipo_edificio, andar, elevador, certificado_energetico,
    meses_caucao, fianca,
  } = req.body;

  if (!titulo || !cidade || !tipologia || !preco) {
    return res.status(400).json({ erro: "Campos obrigatórios: titulo, cidade, tipologia, preco" });
  }

  try {
    const [result] = await db.execute(
      `INSERT INTO imoveis
        (utilizador_id, titulo, cidade, tipologia, preco, descricao, quartos,
         tipo_imovel, aceita_pets, mobiliado, despesas_incluidas, foto, disponivel,
         area, casas_banho, varanda, garagem, estado, armarios_embutidos, orientacao,
         cozinha_equipada, aquecimento, tipo_edificio, andar, elevador, certificado_energetico,
         meses_caucao, fianca)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.utilizador.id, titulo, cidade, tipologia, preco,
        descricao || null, quartos || null, tipo_imovel || null,
        aceita_pets ? 1 : 0, mobiliado ? 1 : 0, despesas_incluidas ? 1 : 0, foto || null,
        area || null, casas_banho || null,
        varanda ? 1 : 0, garagem ? 1 : 0,
        estado || null, armarios_embutidos ? 1 : 0,
        orientacao || null, cozinha_equipada ? 1 : 0,
        aquecimento || null, tipo_edificio || null, andar || null,
        elevador ? 1 : 0, certificado_energetico || null,
        meses_caucao ? Number(meses_caucao) : null, fianca ? 1 : 0,
      ]
    );
    res.status(201).json({ id: result.insertId, mensagem: "Imóvel publicado com sucesso" });
  } catch (err) {
    console.error("Erro em POST /api/imoveis:", err.message);
    res.status(500).json({ erro: "Erro ao publicar imóvel" });
  }
});

// PUT /api/imoveis/:id - editar imóvel (apenas o dono)
router.put("/:id", verificarToken, async (req, res) => {
  try {
    const [rows] = await db.execute(
      "SELECT utilizador_id FROM imoveis WHERE id = ?",
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ erro: "Imóvel não encontrado" });
    if (rows[0].utilizador_id !== req.utilizador.id) {
      return res.status(403).json({ erro: "Sem permissão para editar este imóvel" });
    }

    const {
      titulo, cidade, tipologia, preco, descricao,
      quartos, tipo_imovel, aceita_pets, mobiliado,
      despesas_incluidas, foto, disponivel,
      // novos campos
      area, casas_banho, varanda, garagem, estado,
      armarios_embutidos, orientacao, cozinha_equipada,
      aquecimento, tipo_edificio, andar, elevador, certificado_energetico,
      meses_caucao, fianca,
    } = req.body;

    await db.execute(
      `UPDATE imoveis SET
        titulo = ?, cidade = ?, tipologia = ?, preco = ?, descricao = ?,
        quartos = ?, tipo_imovel = ?, aceita_pets = ?, mobiliado = ?,
        despesas_incluidas = ?, foto = ?, disponivel = ?,
        area = ?, casas_banho = ?, varanda = ?, garagem = ?, estado = ?,
        armarios_embutidos = ?, orientacao = ?, cozinha_equipada = ?,
        aquecimento = ?, tipo_edificio = ?, andar = ?, elevador = ?,
        certificado_energetico = ?, meses_caucao = ?, fianca = ?
       WHERE id = ?`,
      [
        titulo, cidade, tipologia, preco,
        descricao || null, quartos || null, tipo_imovel || null,
        aceita_pets ? 1 : 0, mobiliado ? 1 : 0, despesas_incluidas ? 1 : 0,
        foto || null,
        disponivel !== undefined ? (disponivel ? 1 : 0) : 1,
        area || null, casas_banho || null,
        varanda ? 1 : 0, garagem ? 1 : 0,
        estado || null, armarios_embutidos ? 1 : 0,
        orientacao || null, cozinha_equipada ? 1 : 0,
        aquecimento || null, tipo_edificio || null, andar || null,
        elevador ? 1 : 0, certificado_energetico || null,
        meses_caucao ? Number(meses_caucao) : null, fianca ? 1 : 0,
        req.params.id,
      ]
    );
    res.json({ mensagem: "Imóvel atualizado com sucesso" });
  } catch (err) {
    console.error("Erro em PUT /api/imoveis/:id:", err.message);
    res.status(500).json({ erro: "Erro ao atualizar imóvel" });
  }
});

// DELETE /api/imoveis/:id - eliminar imóvel (apenas o dono)
router.delete("/:id", verificarToken, async (req, res) => {
  try {
    const [rows] = await db.execute(
      "SELECT utilizador_id FROM imoveis WHERE id = ?",
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ erro: "Imóvel não encontrado" });
    if (rows[0].utilizador_id !== req.utilizador.id) {
      return res.status(403).json({ erro: "Sem permissão para eliminar este imóvel" });
    }

    await db.execute("DELETE FROM imoveis WHERE id = ?", [req.params.id]);
    res.json({ mensagem: "Imóvel eliminado com sucesso" });
  } catch (err) {
    console.error("Erro em DELETE /api/imoveis/:id:", err.message);
    res.status(500).json({ erro: "Erro ao eliminar imóvel" });
  }
});

module.exports = router;
