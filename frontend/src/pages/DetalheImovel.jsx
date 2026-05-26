import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Loading from "../components/Loading";
import MapaImovel from "../components/MapaImovel";
import SEO from "../components/SEO";
import { useTema } from "../context/ThemeContext";
import { getImovelById, getAvaliacoesAnunciante, getFavoritos, adicionarFavorito, removerFavorito, registarVisualizacao, verificarInteresse, enviarInteresse } from "../services/api";
import { isAutenticado, getUtilizador } from "../services/auth";

function GaleriaFotos({ fotos, titulo, favorito, togglingFav, onToggleFavorito }) {
  const [ativa, setAtiva] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  // Fechar lightbox com Escape
  useEffect(() => {
    if (!lightbox) return;
    const handler = (e) => { if (e.key === "Escape") setLightbox(false); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [lightbox]);

  if (!fotos || fotos.length === 0) {
    return (
      <div className="d-flex align-items-center justify-content-center bg-light"
        style={{ height: 300, fontSize: "4rem", color: "#ccc" }}>🏠</div>
    );
  }

  const irAnterior = (e) => { e?.stopPropagation(); setAtiva((i) => (i - 1 + fotos.length) % fotos.length); };
  const irSeguinte = (e) => { e?.stopPropagation(); setAtiva((i) => (i + 1) % fotos.length); };

  return (
    <>
      {/* Imagem principal */}
      <div style={{ position: "relative" }}>
        <img src={fotos[ativa]} alt={titulo}
          className="w-100"
          style={{ maxHeight: 420, objectFit: "cover", display: "block", cursor: "zoom-in" }}
          onClick={() => setLightbox(true)}
          title="Clique para ver em tamanho completo"
        />
        {/* Botão favoritar */}
        {onToggleFavorito && (
          <button
            onClick={(e) => { e.stopPropagation(); onToggleFavorito(); }}
            disabled={togglingFav}
            title={favorito ? "Remover dos favoritos" : "Adicionar aos favoritos"}
            style={{
              position: "absolute", top: 10, right: 10,
              background: "rgba(255,255,255,0.92)",
              border: "none",
              borderRadius: "50%",
              width: 42, height: 42,
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer",
              boxShadow: "0 2px 8px rgba(0,0,0,0.22)",
              fontSize: "1.25rem",
              transition: "transform 0.15s",
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.13)"}
            onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
          >
            {favorito ? "❤️" : "🤍"}
          </button>
        )}
        {fotos.length > 1 && (
          <>
            <button onClick={irAnterior}
              style={{
                position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)",
                background: "rgba(0,0,0,0.55)", color: "#fff", border: "none", borderRadius: "50%",
                width: 38, height: 38, fontSize: "1.2rem", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>‹</button>
            <button onClick={irSeguinte}
              style={{
                position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
                background: "rgba(0,0,0,0.55)", color: "#fff", border: "none", borderRadius: "50%",
                width: 38, height: 38, fontSize: "1.2rem", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>›</button>
          </>
        )}
        {/* Botão fullscreen + contador */}
        <div style={{ position: "absolute", bottom: 10, right: 12, display: "flex", gap: 6, alignItems: "center" }}>
          {fotos.length > 1 && (
            <span style={{
              background: "rgba(0,0,0,0.55)", color: "#fff",
              fontSize: "0.75rem", padding: "2px 10px", borderRadius: 20,
            }}>{ativa + 1} / {fotos.length}</span>
          )}
          <button onClick={() => setLightbox(true)} title="Ver em tamanho completo"
            style={{
              background: "rgba(0,0,0,0.55)", color: "#fff", border: "none", borderRadius: 6,
              width: 30, height: 26, cursor: "pointer", fontSize: "0.85rem",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>⛶</button>
        </div>
      </div>

      {/* Tira de miniaturas */}
      {fotos.length > 1 && (
        <div className="d-flex gap-1 p-2" style={{ background: "#111", flexWrap: "wrap" }}>
          {fotos.map((url, idx) => (
            <img key={idx} src={url} alt={`Foto ${idx + 1}`}
              onClick={() => setAtiva(idx)}
              style={{
                width: 62, height: 46, objectFit: "cover", borderRadius: 6, cursor: "pointer",
                border: idx === ativa ? "2px solid #FFC300" : "2px solid transparent",
                opacity: idx === ativa ? 1 : 0.55, transition: "opacity 0.2s",
              }} />
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div
          onClick={() => setLightbox(false)}
          style={{
            position: "fixed", inset: 0, zIndex: 9999,
            background: "rgba(0,0,0,0.92)",
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
          }}
        >
          {/* Fechar */}
          <button onClick={() => setLightbox(false)}
            style={{
              position: "absolute", top: 16, right: 20,
              background: "rgba(255,255,255,0.12)", color: "#fff", border: "none",
              borderRadius: "50%", width: 40, height: 40, fontSize: "1.3rem",
              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
            }}>✕</button>

          {/* Imagem a tamanho completo */}
          <img
            src={fotos[ativa]} alt={titulo}
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: "90vw", maxHeight: "82vh",
              objectFit: "contain", borderRadius: 8,
              boxShadow: "0 8px 40px rgba(0,0,0,0.6)",
            }}
          />

          {/* Navegação lightbox */}
          {fotos.length > 1 && (
            <>
              <button onClick={irAnterior}
                style={{
                  position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)",
                  background: "rgba(255,255,255,0.12)", color: "#fff", border: "none", borderRadius: "50%",
                  width: 48, height: 48, fontSize: "1.6rem", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>‹</button>
              <button onClick={irSeguinte}
                style={{
                  position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)",
                  background: "rgba(255,255,255,0.12)", color: "#fff", border: "none", borderRadius: "50%",
                  width: 48, height: 48, fontSize: "1.6rem", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>›</button>
              {/* Miniaturas no lightbox */}
              <div className="d-flex gap-2 mt-3" style={{ flexWrap: "wrap", justifyContent: "center" }}
                onClick={(e) => e.stopPropagation()}>
                {fotos.map((url, idx) => (
                  <img key={idx} src={url} alt={`Foto ${idx + 1}`}
                    onClick={() => setAtiva(idx)}
                    style={{
                      width: 56, height: 40, objectFit: "cover", borderRadius: 5, cursor: "pointer",
                      border: idx === ativa ? "2px solid #FFC300" : "2px solid rgba(255,255,255,0.2)",
                      opacity: idx === ativa ? 1 : 0.5, transition: "opacity 0.2s",
                    }} />
                ))}
              </div>
              <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.8rem", marginTop: 8 }}>
                {ativa + 1} / {fotos.length}
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}

function tempoRelativo(dataStr) {
  if (!dataStr) return null;
  const diff = Math.floor((Date.now() - new Date(dataStr).getTime()) / 1000);
  if (diff < 60) return "há menos de 1 minuto";
  if (diff < 3600) return `há ${Math.floor(diff / 60)} minuto${Math.floor(diff / 60) !== 1 ? "s" : ""}`;
  if (diff < 86400) return `há ${Math.floor(diff / 3600)} hora${Math.floor(diff / 3600) !== 1 ? "s" : ""}`;
  if (diff < 2592000) return `há ${Math.floor(diff / 86400)} dia${Math.floor(diff / 86400) !== 1 ? "s" : ""}`;
  return new Date(dataStr).toLocaleDateString("pt-PT", { day: "numeric", month: "long", year: "numeric" });
}

const CERT_CORES = {
  "A+": "#00873e", A: "#2ecc40", B: "#8bc34a", "B-": "#cddc39",
  C: "#ffeb3b", D: "#ff9800", E: "#ff5722", F: "#e53935", G: "#b71c1c",
};

function Detalhe({ icon, label, valor }) {
  if (!valor && valor !== 0) return null;
  return (
    <div className="d-flex align-items-start gap-2 py-2" style={{ borderBottom: "1px solid #f0f0f0" }}>
      <span style={{ fontSize: "1rem", minWidth: 22 }}>{icon}</span>
      <span className="text-muted" style={{ fontSize: "0.88rem", minWidth: 130 }}>{label}</span>
      {valor === "Sim"
        ? <span className="fw-semibold d-flex align-items-center gap-1" style={{ fontSize: "0.88rem", color: "#198754" }}>✅ Sim</span>
        : valor === "Não"
        ? <span className="fw-semibold d-flex align-items-center gap-1" style={{ fontSize: "0.88rem", color: "#dc3545" }}><span style={{ fontWeight: "bold" }}>✕</span> Não</span>
        : <span className="fw-semibold" style={{ fontSize: "0.88rem", color: "#1a1a1a" }}>{valor}</span>
      }
    </div>
  );
}

export default function DetalheImovel() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { darkMode } = useTema();
  const [imovel, setImovel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);
  const [statsAnunciante, setStatsAnunciante] = useState(null);
  const [descricaoExpandida, setDescricaoExpandida] = useState(false);
  const [favorito, setFavorito] = useState(false);
  const [togglingFav, setTogglingFav] = useState(false);

  // interesse
  const [jaEnviouInteresse, setJaEnviouInteresse] = useState(false);
  const [aEnviarInteresse, setAEnviarInteresse] = useState(false);
  const [interesseEnviado, setInteresseEnviado] = useState(false);

  useEffect(() => {
    getImovelById(id)
      .then((data) => {
        setImovel(data);
        if (data.utilizador_id) {
          getAvaliacoesAnunciante(data.utilizador_id)
            .then((r) => setStatsAnunciante(r.stats))
            .catch(() => {});
        }
        // Registar visualização — ignora se o utilizador for o dono do imóvel
        const utilizadorAtual = getUtilizador();
        if (!utilizadorAtual || utilizadorAtual.id !== data.utilizador_id) {
          registarVisualizacao(id);
        }
      })
      .catch(() => setErro("Imóvel não encontrado."))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (isAutenticado()) {
      getFavoritos().then(ids => {
        setFavorito(ids.includes(Number(id)));
      }).catch(() => {});

      const u = getUtilizador();
      if (u?.perfil === "inquilino") {
        verificarInteresse(id).then(({ jaEnviou }) => setJaEnviouInteresse(jaEnviou)).catch(() => {});
      }
    }
  }, [id]);

  async function toggleFavorito() {
    if (!isAutenticado()) return;
    setTogglingFav(true);
    try {
      if (favorito) { await removerFavorito(id); setFavorito(false); }
      else { await adicionarFavorito(id); setFavorito(true); }
    } finally { setTogglingFav(false); }
  }

  async function handleInteresse() {
    if (!isAutenticado()) {
      navigate("/login");
      return;
    }
    setAEnviarInteresse(true);
    try {
      await enviarInteresse(id);
      setJaEnviouInteresse(true);
      setInteresseEnviado(true);
    } catch (err) {
      if (err.message === "curriculo_em_falta") {
        navigate("/curriculo", { state: { redirectTo: `/imoveis/${id}` } });
      }
    } finally {
      setAEnviarInteresse(false);
    }
  }

  if (loading) return <div className="container py-5"><Loading /></div>;
  if (erro)
    return (
      <div className="container py-5 text-center">
        <p className="text-danger fs-5">{erro}</p>
        <Link to="/imoveis" className="btn btn-dark">Voltar aos imóveis</Link>
      </div>
    );

  const temEspecificas = imovel.area || imovel.casas_banho || imovel.varanda || imovel.garagem ||
    imovel.estado || imovel.armarios_embutidos || imovel.orientacao || imovel.cozinha_equipada ||
    imovel.cozinha_mobilada || imovel.aquecimento || imovel.tipo_edificio || imovel.andar || imovel.certificado_energetico;

  const jsonLdImovel = imovel ? {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    "name": imovel.titulo,
    "description": imovel.descricao || imovel.titulo,
    "url": `https://arrendahouse.pt/imoveis/${id}`,
    "image": Array.isArray(imovel.fotos) && imovel.fotos.length > 0 ? imovel.fotos[0] : imovel.foto,
    "offers": {
      "@type": "Offer",
      "price": imovel.preco,
      "priceCurrency": "EUR",
      "availability": "https://schema.org/InStock",
    },
    "address": {
      "@type": "PostalAddress",
      "addressLocality": imovel.cidade,
      "addressCountry": "PT",
    },
  } : null;

  return (
    <div style={{ minHeight: "100vh", background: "#f8f9fa" }}>
      {imovel && (
        <SEO
          titulo={`${imovel.titulo} — ${imovel.cidade}`}
          descricao={imovel.descricao
            ? imovel.descricao.slice(0, 155) + (imovel.descricao.length > 155 ? "…" : "")
            : `${imovel.titulo} em ${imovel.cidade} — ${Number(imovel.preco).toLocaleString("pt-PT")} €/mês. Vê detalhes e candidata-te no ArrendaHouse.`}
          imagem={Array.isArray(imovel.fotos) && imovel.fotos.length > 0 ? imovel.fotos[0] : imovel.foto}
          url={`https://arrendahouse.pt/imoveis/${id}`}
          tipo="product"
          jsonLd={jsonLdImovel}
        />
      )}
      <div className="container py-5">
        <Link to="/imoveis" className="btn btn-outline-secondary btn-sm mb-4">
          ← Voltar
        </Link>

        <div className="row g-4">
          {/* Coluna esquerda: foto + características */}
          <div className="col-12 col-lg-7">
            {/* Foto / Galeria */}
            <div style={{ borderRadius: 16, overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}>
              <GaleriaFotos
                fotos={Array.isArray(imovel.fotos) && imovel.fotos.length > 0
                  ? imovel.fotos
                  : imovel.foto ? [imovel.foto] : []}
                titulo={imovel.titulo}
                favorito={favorito}
                togglingFav={togglingFav}
                onToggleFavorito={isAutenticado() ? toggleFavorito : null}
              />
            </div>

            {/* Stats rápidas */}
            {(imovel.area || imovel.quartos || imovel.casas_banho || imovel.tipo_imovel) && (
              <div className="d-flex flex-wrap gap-2 mt-3">
                {imovel.area && (
                  <div className="d-flex align-items-center gap-1 px-3 py-2 rounded-pill"
                    style={{ background: "#fff", border: "1.5px solid #e0e0e0", fontSize: "0.85rem", fontWeight: 600 }}>
                    📐 {imovel.area} m²
                  </div>
                )}
                {imovel.quartos > 0 && (
                  <div className="d-flex align-items-center gap-1 px-3 py-2 rounded-pill"
                    style={{ background: "#fff", border: "1.5px solid #e0e0e0", fontSize: "0.85rem", fontWeight: 600 }}>
                    🛏️ {imovel.quartos} {imovel.quartos === 1 ? "quarto" : "quartos"}
                  </div>
                )}
                {imovel.casas_banho > 0 && (
                  <div className="d-flex align-items-center gap-1 px-3 py-2 rounded-pill"
                    style={{ background: "#fff", border: "1.5px solid #e0e0e0", fontSize: "0.85rem", fontWeight: 600 }}>
                    🚿 {imovel.casas_banho} {imovel.casas_banho === 1 ? "casa de banho" : "casas de banho"}
                  </div>
                )}
                {imovel.tipo_imovel && (
                  <div className="d-flex align-items-center gap-1 px-3 py-2 rounded-pill"
                    style={{ background: "#fff", border: "1.5px solid #e0e0e0", fontSize: "0.85rem", fontWeight: 600 }}>
                    🏢 {imovel.tipo_imovel}
                  </div>
                )}
              </div>
            )}

            {/* Condições de Entrada */}
            {(imovel.meses_caucao || imovel.fianca || imovel.data_disponivel !== undefined) && (
              <div className="mt-4 p-4"
                style={{ background: darkMode ? "#2a2200" : "#fff8e1", borderRadius: 16, border: "1.5px solid #FFC300", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
                <h6 className="fw-bold mb-3" style={{ color: darkMode ? "#FFC300" : "#1a1a1a" }}>🔐 Condições de Entrada</h6>
                <div className="d-flex flex-column gap-2">
                  <div className="d-flex justify-content-between align-items-center">
                    <span style={{ fontSize: "0.85rem", color: darkMode ? "#aaa" : "#6c757d" }}>🗓️ Disponibilidade</span>
                    <span className="fw-semibold" style={{
                      color: !imovel.data_disponivel ? "#2e7d32" : (darkMode ? "#e0e0e0" : "#1a1a1a"),
                      background: !imovel.data_disponivel ? "rgba(46,125,50,0.12)" : "transparent",
                      padding: !imovel.data_disponivel ? "2px 10px" : undefined,
                      borderRadius: !imovel.data_disponivel ? 20 : undefined,
                      fontSize: "0.9rem",
                    }}>
                      {imovel.data_disponivel
                        ? new Date(imovel.data_disponivel + "T12:00:00").toLocaleDateString("pt-PT", { day: "numeric", month: "long", year: "numeric" })
                        : "✅ Entrada imediata"}
                    </span>
                  </div>
                  {(imovel.meses_caucao || imovel.fianca) && (
                    <hr style={{ borderColor: darkMode ? "#444" : "#ffe082", margin: "4px 0" }} />
                  )}
                  {imovel.meses_caucao && (
                    <>
                      <div className="d-flex justify-content-between align-items-center">
                        <span style={{ fontSize: "0.85rem", color: darkMode ? "#aaa" : "#6c757d" }}>💰 Caução</span>
                        <span className="fw-bold" style={{ color: darkMode ? "#e0e0e0" : "#1a1a1a" }}>
                          {imovel.meses_caucao} {imovel.meses_caucao === 1 ? "mês" : "meses"} de renda
                        </span>
                      </div>
                      <div className="d-flex justify-content-between align-items-center">
                        <span style={{ fontSize: "0.85rem", color: darkMode ? "#aaa" : "#6c757d" }}>📊 Valor da caução</span>
                        <span className="fw-bold" style={{ color: darkMode ? "#FFD740" : "#b8860b" }}>
                          {(Number(imovel.preco) * imovel.meses_caucao).toLocaleString("pt-PT")} €
                        </span>
                      </div>
                      <div className="d-flex justify-content-between align-items-center pt-2"
                        style={{ borderTop: "1px dashed #FFC300" }}>
                        <span className="fw-semibold" style={{ fontSize: "0.88rem", color: darkMode ? "#e0e0e0" : "#1a1a1a" }}>💵 Total entrada estimado</span>
                        <span className="fw-bold fs-6" style={{ color: darkMode ? "#FFD740" : "#b8860b" }}>
                          {(Number(imovel.preco) * (imovel.meses_caucao + 1)).toLocaleString("pt-PT")} €
                        </span>
                      </div>
                      <div style={{ fontSize: "0.75rem", color: darkMode ? "#aaa" : "#6c757d" }}>
                        * Caução ({imovel.meses_caucao}×{Number(imovel.preco).toLocaleString("pt-PT")} €) + 1.º mês de renda
                      </div>
                    </>
                  )}
                  {imovel.fianca && (
                    <div className="d-flex align-items-center gap-2 mt-1 pt-2"
                      style={{ borderTop: imovel.meses_caucao ? "none" : undefined }}>
                      <span>🤝</span>
                      <span className="fw-semibold" style={{ fontSize: "0.88rem", color: darkMode ? "#e0e0e0" : "#1a1a1a" }}>Fiança obrigatória</span>
                      <span style={{ fontSize: "0.78rem", color: darkMode ? "#aaa" : "#6c757d" }}>(fiador exigido)</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Características Específicas */}
            {temEspecificas && (
              <div className="mt-4 p-4"
                style={{ background: "#fff", borderRadius: 16, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
                <h6 className="fw-bold mb-3" style={{ color: "#1a1a1a" }}>🏗️ Características Específicas</h6>

                <Detalhe icon="📐" label="Área bruta" valor={imovel.area ? `${imovel.area} m²` : null} />
                <Detalhe icon="🛏️" label="Tipologia" valor={imovel.tipologia} />
                <Detalhe icon="🚿" label="Casas de banho" valor={imovel.casas_banho} />
                <Detalhe icon="🌿" label="Varanda" valor={imovel.varanda ? "Sim" : null} />
                <Detalhe icon="🚗" label="Garagem" valor={imovel.garagem ? "Incluída no preço" : null} />
                <Detalhe icon="🔑" label="Estado" valor={imovel.estado} />
                <Detalhe icon="🗄️" label="Armários embutidos" valor={imovel.armarios_embutidos ? "Sim" : null} />
                <Detalhe icon="🧭" label="Orientação" valor={imovel.orientacao} />
                <Detalhe icon="🍳" label="Cozinha equipada" valor={imovel.cozinha_equipada ? "Sim" : null} />
                <Detalhe icon="🍴" label="Cozinha mobilada" valor={imovel.cozinha_mobilada ? "Sim" : "Não"} />
                <Detalhe icon="🔥" label="Aquecimento" valor={imovel.aquecimento} />
                <Detalhe icon="🏢" label="Tipo de edifício" valor={imovel.tipo_edificio} />
                <Detalhe icon="🛗" label="Andar" valor={imovel.andar} />
                <Detalhe icon="🛗" label="Elevador" valor={imovel.elevador ? "Sim" : (imovel.andar ? "Não" : null)} />
                <Detalhe icon="🐾" label="Aceita animais" valor={imovel.aceita_pets ? "Sim" : "Não"} />
                <Detalhe icon="🛋️" label="Mobilado" valor={imovel.mobiliado ? "Sim" : "Não"} />
                <Detalhe icon="💡" label="Despesas incluídas" valor={imovel.despesas_incluidas ? "Sim" : "Não"} />

                {/* Certificado energético */}
                {imovel.certificado_energetico && (
                  <div className="d-flex align-items-center gap-2 py-2">
                    <span style={{ fontSize: "1rem", minWidth: 22 }}>⚡</span>
                    <span className="text-muted" style={{ fontSize: "0.88rem", minWidth: 130 }}>Certificado energético</span>
                    <span
                      className="fw-bold px-3 py-1 rounded"
                      style={{
                        background: CERT_CORES[imovel.certificado_energetico] || "#999",
                        color: "#fff",
                        fontSize: "0.9rem",
                        letterSpacing: "1px",
                      }}
                    >
                      {imovel.certificado_energetico}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Mapa */}
            {(imovel.latitude && imovel.longitude) && (
              <div className="mt-4">
                <MapaImovel
                  latitude={imovel.latitude}
                  longitude={imovel.longitude}
                  titulo={imovel.titulo}
                />
              </div>
            )}


          </div>

          {/* Coluna direita: preço, extras, senhorio, CTA */}
          <div className="col-12 col-lg-5">
            <div style={{ position: "sticky", top: 80 }}>
              <div className="d-flex align-items-center gap-2 mb-3">
                <span className="badge bg-warning text-dark fs-6">{imovel.tipologia}</span>
                <span className="badge bg-dark fs-6">{imovel.cidade}</span>
                <span
                  title="Clique para copiar a referência"
                  onClick={() => navigator.clipboard.writeText(`AH-${String(imovel.id).padStart(6, "0")}`)}
                  style={{ fontSize: "0.72rem", letterSpacing: "0.8px", fontWeight: 600, color: "#888", cursor: "pointer", userSelect: "none" }}
                >
                  Ref. AH-{String(imovel.id).padStart(6, "0")} 📋
                </span>
              </div>

              <h1 className="fw-bold mb-2" style={{ fontSize: "1.6rem" }}>{imovel.titulo}</h1>

              {/* Datas */}
              <div className="d-flex flex-wrap gap-3 mb-3" style={{ fontSize: "0.78rem", color: "#888" }}>
                {imovel.criado_em && (
                  <span>
                    📅 Publicado em {new Date(imovel.criado_em).toLocaleDateString("pt-PT", { day: "numeric", month: "long", year: "numeric" })}
                  </span>
                )}
                {imovel.atualizado_em && (
                  <span>🔄 Atualizado {tempoRelativo(imovel.atualizado_em)}</span>
                )}
              </div>

              {/* Preço */}
              <div className="p-4 mb-4"
                style={{ background: "#1a1a1a", borderRadius: 14 }}>
                <span className="text-white-50 small text-uppercase fw-semibold">Renda mensal</span>
                <div className="mt-1">
                  <span style={{ fontSize: "2rem", fontWeight: 800, color: "#FFC300" }}>
                    {Number(imovel.preco).toLocaleString("pt-PT")} €
                  </span>
                  <span className="text-white-50 fw-normal" style={{ fontSize: "0.9rem" }}>/mês</span>
                </div>
                {imovel.despesas_incluidas ? (
                  <span className="badge mt-2" style={{ background: "rgba(255,195,0,0.15)", color: "#FFC300", fontSize: "0.72rem" }}>
                    💡 Despesas incluídas
                  </span>
                ) : null}
              </div>

              {imovel.descricao && (
                <div className="mb-4 p-3"
                  style={{ background: darkMode ? "#2a2a2a" : "#f8f9fa", borderRadius: 12, borderLeft: "4px solid #FFC300" }}>
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <span style={{ fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: 700, color: "#FFC300" }}>
                      💬 Comentário do anunciante
                    </span>
                  </div>
                  <p className="mb-0" style={{
                    fontSize: "0.9rem", color: darkMode ? "#e0e0e0" : "#444", lineHeight: 1.6, whiteSpace: "pre-line",
                    ...(!descricaoExpandida ? {
                      display: "-webkit-box",
                      WebkitLineClamp: 7,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    } : {}),
                  }}>
                    {imovel.descricao}
                  </p>
                  {imovel.descricao.split("\n").length > 7 || imovel.descricao.length > 350 ? (
                    <button
                      className="btn btn-link p-0 mt-1"
                      style={{ fontSize: "0.8rem", color: "#FFC300", textDecoration: "none", fontWeight: 600 }}
                      onClick={() => setDescricaoExpandida(v => !v)}
                    >
                      {descricaoExpandida ? "▲ Ver menos" : "▼ Ver mais"}
                    </button>
                  ) : null}
                </div>
              )}

              {/* Publicado por */}
              {imovel.senhorio_nome && (
                <Link to={`/anunciante/${imovel.utilizador_id}`}
                  className="d-flex align-items-center gap-3 p-3 mb-4 text-decoration-none"
                  style={{ borderRadius: 12, background: "#f8f9fa", border: "1.5px solid #e0e0e0", transition: "border-color 0.2s" }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = "#FFC300"}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = "#e0e0e0"}>
                  {imovel.senhorio_foto ? (
                    <img src={imovel.senhorio_foto} alt={imovel.senhorio_nome}
                      style={{ width: 46, height: 46, borderRadius: "50%", objectFit: "cover", border: "2px solid #FFC300" }} />
                  ) : (
                    <div style={{
                      width: 46, height: 46, borderRadius: "50%",
                      background: "#FFC300", color: "#1a1a1a",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontWeight: "bold", fontSize: "1.1rem", flexShrink: 0,
                    }}>
                      {imovel.senhorio_nome[0].toUpperCase()}
                    </div>
                  )}
                  <div className="flex-grow-1">
                    <div className="text-muted" style={{ fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: 600 }}>
                      🔑 Publicado por
                    </div>
                    <div className="fw-bold" style={{ color: "#1a1a1a", fontSize: "0.95rem" }}>
                      {imovel.senhorio_nome}
                    </div>
                    {statsAnunciante && statsAnunciante.total > 0 ? (
                      <div className="d-flex align-items-center gap-1 mt-1">
                        {[1,2,3,4,5].map((n) => (
                          <span key={n} style={{ color: n <= Math.round(statsAnunciante.media) ? "#FFC300" : "#ddd", fontSize: "0.9rem" }}>★</span>
                        ))}
                        <span style={{ fontSize: "0.78rem", color: "#888", marginLeft: 2 }}>{statsAnunciante.media} ({statsAnunciante.total} {statsAnunciante.total === 1 ? "avaliação" : "avaliações"})</span>
                      </div>
                    ) : (
                      <div style={{ fontSize: "0.78rem", color: "#aaa", marginTop: 2 }}>Ver perfil e avaliações →</div>
                    )}
                    {imovel.senhorio_membro_desde && (
                      <div className="text-muted" style={{ fontSize: "0.75rem" }}>
                        Membro desde {new Date(imovel.senhorio_membro_desde).toLocaleDateString("pt-PT", { month: "long", year: "numeric" })}
                      </div>
                    )}
                  </div>
                  <span style={{ color: "#bbb", fontSize: "1.2rem" }}>›</span>
                </Link>
              )}

              {/* Botão Tenho Interesse */}
              {(() => {
                const utilizador = getUtilizador();
                const eDono = utilizador && imovel.utilizador_id === utilizador.id;
                const eSenhorio = utilizador?.perfil === "senhorio";

                if (eDono || eSenhorio) return null;

                if (jaEnviouInteresse || interesseEnviado) {
                  return (
                    <div
                      className="d-flex align-items-center justify-content-center gap-2 py-3 px-4 w-100"
                      style={{
                        background: "#e8f5e9",
                        borderRadius: 12,
                        border: "1.5px solid #a5d6a7",
                        color: "#2e7d32",
                        fontWeight: 600,
                        fontSize: "1rem",
                      }}
                    >
                      ✅ Interesse enviado ao senhorio
                    </div>
                  );
                }

                return (
                  <button
                    className="btn btn-warning btn-lg w-100 fw-semibold"
                    style={{ borderRadius: 12 }}
                    onClick={handleInteresse}
                    disabled={aEnviarInteresse}
                  >
                    {aEnviarInteresse ? "A enviar..." : "🤝 Tenho interesse"}
                  </button>
                );
              })()}

              {!isAutenticado() && (
                <p className="text-center text-muted mt-2" style={{ fontSize: "0.8rem" }}>
                  <Link to="/login" style={{ color: "#FFC300" }}>Inicia sessão</Link> para manifestar interesse
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

