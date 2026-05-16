/**
 * Calcula a compatibilidade entre um imóvel e o perfil de procura do utilizador.
 * Retorna score (0-100) e razões de compatibilidade.
 */
export function calcularScore(imovel, perfil) {
  if (!perfil) return { score: 75, razoes: [] };

  let pontos = 0;
  let total = 0;
  const razoes = [];

  // ── Preço (40 pts) ──────────────────────────────────────────
  if (perfil.preco_max) {
    total += 40;
    if (imovel.preco <= perfil.preco_max) {
      pontos += 40;
      razoes.push("💰 Dentro do orçamento");
    } else if (imovel.preco <= perfil.preco_max * 1.1) {
      pontos += 20; // slightly over budget
    }
  }

  // ── Cidade (30 pts) ─────────────────────────────────────────
  if (perfil.cidade) {
    total += 30;
    const cidadePerfil = perfil.cidade.toLowerCase().trim();
    const cidadeImovel = imovel.cidade.toLowerCase().trim();
    if (cidadeImovel.includes(cidadePerfil) || cidadePerfil.includes(cidadeImovel)) {
      pontos += 30;
      razoes.push("📍 Localização certa");
    }
  }

  // ── Tipologia (20 pts) ──────────────────────────────────────
  if (perfil.tipologia) {
    total += 20;
    if (imovel.tipologia === perfil.tipologia) {
      pontos += 20;
      razoes.push("🏠 Tipologia ideal");
    }
  }

  // ── Extras (10 pts) ─────────────────────────────────────────
  if (perfil.aceita_pets && imovel.aceita_pets) {
    total += 5; pontos += 5;
    razoes.push("🐾 Aceita pets");
  }
  if (perfil.mobiliado && imovel.mobiliado) {
    total += 5; pontos += 5;
    razoes.push("🛋️ Mobiliado");
  }
  if (perfil.despesas_incluidas && imovel.despesas_incluidas) {
    total += 5; pontos += 5;
    razoes.push("💡 Despesas incluídas");
  }

  const score = total > 0 ? Math.round((pontos / total) * 100) : 72;
  return { score: Math.min(score, 100), razoes };
}

export function getScoreInfo(score) {
  if (score >= 90) return { label: "Perfeito para si!", color: "#22c55e", bg: "rgba(34,197,94,0.15)" };
  if (score >= 75) return { label: "Muito compatível", color: "#84cc16", bg: "rgba(132,204,22,0.15)" };
  if (score >= 60) return { label: "Bom match", color: "#FFC300", bg: "rgba(255,195,0,0.15)" };
  if (score >= 40) return { label: "Compatível", color: "#f97316", bg: "rgba(249,115,22,0.15)" };
  return { label: "Pouco compatível", color: "#ef4444", bg: "rgba(239,68,68,0.15)" };
}
