import { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getUtilizador } from "../services/auth";
import { getPerfilProcura, getImoveisSwipe } from "../services/procura";
import { calcularScore } from "../utils/compatibilidade";
import SwipeCard from "../components/SwipeCard";
import Loading from "../components/Loading";
import logo from "../assets/logo.png";

const LIKED_KEY = "ah_liked_ids";
const SKIPPED_KEY = "ah_skipped_ids";

export default function SwipeImoveis() {
  const navigate = useNavigate();
  const utilizador = getUtilizador();

  const [perfil, setPerfil] = useState(null);
  const [imoveis, setImoveis] = useState([]);
  const [cardIndex, setCardIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [likedIds, setLikedIds] = useState(
    () => new Set(JSON.parse(localStorage.getItem(LIKED_KEY) || "[]"))
  );
  const [skippedCount, setSkippedCount] = useState(0);

  useEffect(() => {
    if (!utilizador) { navigate("/login"); return; }

    Promise.all([getPerfilProcura(), getImoveisSwipe()])
      .then(([p, imgs]) => {
        if (!p) { navigate("/setup-procura"); return; }
        setPerfil(p);

        // Filter already liked/skipped
        const seen = new Set([
          ...JSON.parse(localStorage.getItem(LIKED_KEY) || "[]"),
          ...JSON.parse(localStorage.getItem(SKIPPED_KEY) || "[]"),
        ]);
        const novos = imgs.filter((im) => !seen.has(im.id));

        // Sort by compatibility score descending
        const scored = novos
          .map((im) => ({ ...im, _score: calcularScore(im, p).score }))
          .sort((a, b) => b._score - a._score);

        setImoveis(scored);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleLike = useCallback((imovel) => {
    const newLiked = [...likedIds, imovel.id];
    setLikedIds(new Set(newLiked));
    localStorage.setItem(LIKED_KEY, JSON.stringify(newLiked));
    setCardIndex((i) => i + 1);
  }, [likedIds]);

  const handleDislike = useCallback((imovel) => {
    const skipped = JSON.parse(localStorage.getItem(SKIPPED_KEY) || "[]");
    localStorage.setItem(SKIPPED_KEY, JSON.stringify([...skipped, imovel.id]));
    setSkippedCount((c) => c + 1);
    setCardIndex((i) => i + 1);
  }, []);

  function reiniciar() {
    localStorage.removeItem(LIKED_KEY);
    localStorage.removeItem(SKIPPED_KEY);
    setLikedIds(new Set());
    setSkippedCount(0);
    setCardIndex(0);
    // Re-sort all
    setImoveis((prev) => [...prev].sort((a, b) => b._score - a._score));
  }

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#f0f4f8" }} className="d-flex align-items-center justify-content-center">
        <div className="text-center">
          <div className="spinner-border mb-3" style={{ color: "#FFC300" }} />
          <p className="text-muted">A carregar imóveis para si...</p>
        </div>
      </div>
    );
  }

  const vistos = cardIndex;
  const restantes = imoveis.length - cardIndex;
  const stack = imoveis.slice(cardIndex, cardIndex + 3);
  const acabou = cardIndex >= imoveis.length;

  // ── Ecrã final ──────────────────────────────────────────────
  if (acabou) {
    return (
      <div
        style={{ minHeight: "100vh", background: "#1a1a1a" }}
        className="d-flex align-items-center justify-content-center py-5"
      >
        <div className="text-center px-4" style={{ maxWidth: 400 }}>
          <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>🎉</div>
          <h2 className="fw-bold text-white mb-2">Viu tudo!</h2>
          <p style={{ color: "rgba(255,255,255,0.55)" }}>
            Explorou {vistos} imóveis e guardou{" "}
            <strong style={{ color: "#FFC300" }}>{likedIds.size}</strong> como favoritos.
          </p>
          <div className="d-flex flex-column gap-3 mt-4">
            <button
              onClick={reiniciar}
              className="btn fw-bold py-3 rounded-3"
              style={{ background: "#FFC300", color: "#1a1a1a" }}
            >
              🔄 Recomeçar
            </button>
            <Link
              to="/imoveis"
              className="btn py-3 rounded-3 fw-semibold"
              style={{ background: "rgba(255,255,255,0.07)", color: "#fff", border: "none" }}
            >
              Ver lista completa
            </Link>
            <Link
              to="/setup-procura"
              className="btn py-2"
              style={{ color: "rgba(255,255,255,0.4)", background: "transparent", border: "none", fontSize: "0.85rem" }}
            >
              ⚙️ Alterar preferências
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const current = stack[0];

  return (
    <div className="swipe-page">
      {/* ── Header ── */}
      <div className="swipe-header">
        <Link to="/" style={{ display: "flex", alignItems: "center" }}>
          <img src={logo} alt="ArrendaHouse" style={{ height: 30, borderRadius: 5 }} />
        </Link>
        <div className="swipe-header-stats">
          <span>❤️ {likedIds.size}</span>
          <span style={{ color: "rgba(255,255,255,0.4)" }}>·</span>
          <span style={{ color: "rgba(255,255,255,0.55)" }}>{restantes} por ver</span>
        </div>
        <Link
          to="/setup-procura"
          style={{ color: "rgba(255,255,255,0.4)", fontSize: "1.2rem", textDecoration: "none" }}
          title="Preferências"
        >
          ⚙️
        </Link>
      </div>

      {/* ── Perfil resumo ── */}
      {perfil && (
        <div className="swipe-perfil-resumo">
          {perfil.cidade && <span className="swipe-filtro-tag">📍 {perfil.cidade}</span>}
          {perfil.tipologia && <span className="swipe-filtro-tag">🏠 {perfil.tipologia}</span>}
          {perfil.preco_max && <span className="swipe-filtro-tag">💰 até €{perfil.preco_max}</span>}
          {perfil.objetivo && <span className="swipe-filtro-tag">{perfil.objetivo === "arrendar" ? "🔑 Arrendar" : "🏡 Comprar"}</span>}
        </div>
      )}

      {/* ── Stack de cards ── */}
      <div className="swipe-stack-wrapper">
        <div className="swipe-stack">
          {stack.map((imovel, i) => (
            <SwipeCard
              key={imovel.id}
              imovel={imovel}
              perfil={perfil}
              onLike={handleLike}
              onDislike={handleDislike}
              isTop={i === 0}
              stackIndex={i}
            />
          ))}
        </div>
      </div>

      {/* ── Botões de ação ── */}
      <div className="swipe-actions">
        {/* Dislike */}
        <button
          className="swipe-btn swipe-btn-dislike"
          onClick={() => handleDislike(current)}
          title="Não tenho interesse"
        >
          ✕
        </button>

        {/* Ver detalhes */}
        <Link
          to={`/imoveis/${current.id}`}
          className="swipe-btn swipe-btn-info"
          title="Ver detalhes"
        >
          ℹ
        </Link>

        {/* Like */}
        <button
          className="swipe-btn swipe-btn-like"
          onClick={() => handleLike(current)}
          title="Gosto"
        >
          ❤️
        </button>
      </div>

      {/* ── Dica ── */}
      <p className="swipe-dica">
        Deslize ← para passar &nbsp;·&nbsp; Deslize → para gostar
      </p>
    </div>
  );
}
