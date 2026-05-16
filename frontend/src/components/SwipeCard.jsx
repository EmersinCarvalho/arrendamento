import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { calcularScore, getScoreInfo } from "../utils/compatibilidade";

const THRESHOLD = 85;
const FOTO_FALLBACK = "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&q=80";

export default function SwipeCard({ imovel, perfil, onLike, onDislike, isTop, stackIndex }) {
  const [offset, setOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [flyingTo, setFlyingTo] = useState(null); // 'left' | 'right' | null
  const startX = useRef(0);

  const { score, razoes } = calcularScore(imovel, perfil);
  const scoreInfo = getScoreInfo(score);

  // Derived visual values
  const rotation = offset * 0.07;
  const likeOpacity = Math.min(Math.max(offset / THRESHOLD, 0), 1);
  const dislikeOpacity = Math.min(Math.max(-offset / THRESHOLD, 0), 1);

  function triggerFly(dir) {
    setFlyingTo(dir);
    setTimeout(() => {
      if (dir === "right") onLike(imovel);
      else onDislike(imovel);
    }, 320);
  }

  // ── Pointer events (desktop + mobile) ──────────────────────
  function onPointerDown(e) {
    if (!isTop || flyingTo) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsDragging(true);
    startX.current = e.clientX;
  }

  function onPointerMove(e) {
    if (!isDragging) return;
    setOffset(e.clientX - startX.current);
  }

  function onPointerUp(e) {
    if (!isDragging) return;
    setIsDragging(false);
    const delta = e.clientX - startX.current;
    if (delta > THRESHOLD) triggerFly("right");
    else if (delta < -THRESHOLD) triggerFly("left");
    else setOffset(0);
  }

  // ── Card styles ─────────────────────────────────────────────
  let cardTransform = "";
  let cardTransition = "";

  if (flyingTo === "right") {
    cardTransform = "translateX(150%) rotate(22deg)";
    cardTransition = "transform 0.32s ease";
  } else if (flyingTo === "left") {
    cardTransform = "translateX(-150%) rotate(-22deg)";
    cardTransition = "transform 0.32s ease";
  } else if (isTop) {
    cardTransform = `translateX(${offset}px) rotate(${rotation}deg)`;
    cardTransition = isDragging ? "none" : "transform 0.35s cubic-bezier(.175,.885,.32,1.275)";
  } else {
    const scale = 1 - stackIndex * 0.04;
    const translateY = stackIndex * 14;
    cardTransform = `scale(${scale}) translateY(${translateY}px)`;
    cardTransition = "transform 0.3s ease";
  }

  return (
    <div
      className="swipe-card"
      style={{
        transform: cardTransform,
        transition: cardTransition,
        zIndex: isTop ? 10 : 10 - stackIndex,
        cursor: isTop ? (isDragging ? "grabbing" : "grab") : "default",
        touchAction: "none",
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    >
      {/* ── Foto ── */}
      <div
        className="swipe-card-photo"
        style={{ backgroundImage: `url(${imovel.foto || FOTO_FALLBACK})` }}
      >
        {/* Overlay GOSTO */}
        <div
          className="swipe-stamp swipe-stamp-like"
          style={{ opacity: likeOpacity }}
        >
          ❤️ GOSTO
        </div>
        {/* Overlay PASSO */}
        <div
          className="swipe-stamp swipe-stamp-dislike"
          style={{ opacity: dislikeOpacity }}
        >
          👎 PASSO
        </div>

        {/* Badge score */}
        <div
          className="swipe-score-badge"
          style={{ background: scoreInfo.color }}
        >
          {score}% match
        </div>

        {/* Selo verificado */}
        {imovel.verificado ? (
          <div className="swipe-verificado-badge">✓ Verificado</div>
        ) : null}
      </div>

      {/* ── Info ── */}
      <div className="swipe-card-info">
        <div className="d-flex justify-content-between align-items-start mb-1">
          <div style={{ flex: 1, minWidth: 0 }}>
            <h5 className="fw-bold mb-0 text-truncate" style={{ color: "#1a1a1a" }}>
              {imovel.titulo}
            </h5>
            <p className="mb-0" style={{ color: "#666", fontSize: "0.85rem" }}>
              📍 {imovel.cidade} &middot; {imovel.tipologia}
              {imovel.quartos > 0 ? ` · ${imovel.quartos} quartos` : ""}
            </p>
          </div>
          <div className="text-end ms-2" style={{ flexShrink: 0 }}>
            <div className="fw-bold" style={{ color: "#1a1a1a", fontSize: "1.1rem" }}>
              €{Number(imovel.preco).toLocaleString()}
            </div>
            <div style={{ color: "#999", fontSize: "0.72rem" }}>/mês</div>
          </div>
        </div>

        {imovel.descricao && (
          <p className="mb-2" style={{ color: "#555", fontSize: "0.82rem", lineHeight: 1.4 }}>
            {imovel.descricao.slice(0, 90)}{imovel.descricao.length > 90 ? "…" : ""}
          </p>
        )}

        {/* Tags de match */}
        <div className="d-flex flex-wrap gap-1">
          {razoes.slice(0, 3).map((r) => (
            <span key={r} className="swipe-match-tag">{r}</span>
          ))}
          {imovel.aceita_pets ? <span className="swipe-extra-tag">🐾 Pets</span> : null}
          {imovel.mobiliado ? <span className="swipe-extra-tag">🛋️ Mobiliado</span> : null}
          {imovel.despesas_incluidas ? <span className="swipe-extra-tag">💡 Despesas</span> : null}
        </div>

        {/* Label de compatibilidade */}
        <div
          className="mt-2 text-center py-1 rounded-2"
          style={{ background: scoreInfo.bg, fontSize: "0.78rem", fontWeight: 600, color: scoreInfo.color }}
        >
          {scoreInfo.label}
        </div>
      </div>
    </div>
  );
}
