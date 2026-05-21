import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getUtilizador } from "../services/auth";
import { getCandidaturasRecebidas, marcarCandidaturaLida } from "../services/api";
import { useTema } from "../context/ThemeContext";
import Loading from "../components/Loading";

function tempoRelativo(dataStr) {
  if (!dataStr) return null;
  const diff = Math.floor((Date.now() - new Date(dataStr).getTime()) / 1000);
  if (diff < 60) return "há menos de 1 minuto";
  if (diff < 3600) return `há ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `há ${Math.floor(diff / 3600)}h`;
  if (diff < 2592000) return `há ${Math.floor(diff / 86400)} dia${Math.floor(diff / 86400) !== 1 ? "s" : ""}`;
  return new Date(dataStr).toLocaleDateString("pt-PT", { day: "numeric", month: "short", year: "numeric" });
}

function BadgeInfo({ icon, label }) {
  return (
    <span className="d-inline-flex align-items-center gap-1 px-2 py-1 rounded-pill me-2 mb-1"
      style={{ background: "#f0f0f0", fontSize: "0.78rem", color: "#444", fontWeight: 500 }}>
      {icon} {label}
    </span>
  );
}

export default function CandidaturasRecebidas() {
  const navigate = useNavigate();
  const utilizador = getUtilizador();
  const { darkMode } = useTema();

  const [candidaturas, setCandidaturas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);
  const [expandido, setExpandido] = useState(null);

  useEffect(() => {
    if (!utilizador) { navigate("/login"); return; }
    if (utilizador.perfil !== "senhorio") { navigate("/"); return; }

    getCandidaturasRecebidas()
      .then(setCandidaturas)
      .catch((err) => setErro(err.message))
      .finally(() => setLoading(false));
  }, []);

  async function handleExpandir(c) {
    setExpandido((prev) => (prev === c.id ? null : c.id));
    if (!c.lida) {
      await marcarCandidaturaLida(c.id).catch(() => {});
      setCandidaturas((prev) =>
        prev.map((x) => (x.id === c.id ? { ...x, lida: 1 } : x))
      );
    }
  }

  const naoLidas = candidaturas.filter((c) => !c.lida).length;

  // Agrupar por imóvel
  const porImovel = candidaturas.reduce((acc, c) => {
    if (!acc[c.imovel_id]) acc[c.imovel_id] = { titulo: c.imovel_titulo, tipologia: c.tipologia, preco: c.preco, lista: [] };
    acc[c.imovel_id].lista.push(c);
    return acc;
  }, {});

  if (!utilizador || utilizador.perfil !== "senhorio") return null;

  return (
    <div style={{ minHeight: "100vh", background: darkMode ? "#121212" : "#f8f9fa" }}>
      {/* Header */}
      <div style={{
        background: "linear-gradient(135deg, #1a1a1a 0%, #2c2c2c 100%)",
        padding: "3rem 0 2.5rem",
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", top: -80, right: -80,
          width: 300, height: 300, borderRadius: "50%",
          background: "rgba(255,195,0,0.06)", pointerEvents: "none",
        }} />
        <div className="container">
          <div className="badge fw-semibold mb-3"
            style={{ background: "rgba(255,195,0,0.15)", color: "#FFC300", fontSize: "0.7rem", letterSpacing: "1px", textTransform: "uppercase", padding: "6px 14px" }}>
            🔑 Área Senhorio
          </div>
          <div className="d-flex align-items-center gap-3 flex-wrap">
            <div>
              <h1 className="text-white fw-bold mb-1" style={{ fontSize: "2rem" }}>
                Candidaturas recebidas
              </h1>
              <p className="mb-0" style={{ color: "#aaa", fontSize: "0.95rem" }}>
                Inquilinos que manifestaram interesse nos seus imóveis
              </p>
            </div>
            {naoLidas > 0 && (
              <span className="badge fs-6 ms-2"
                style={{ background: "#FFC300", color: "#1a1a1a", borderRadius: 20, padding: "6px 16px" }}>
                {naoLidas} nova{naoLidas !== 1 ? "s" : ""}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="container py-5" style={{ maxWidth: 820 }}>
        {loading && <Loading />}

        {erro && !loading && (
          <div className="alert alert-danger border-0" style={{ borderRadius: 12 }}>{erro}</div>
        )}

        {!loading && !erro && candidaturas.length === 0 && (
          <div className="text-center py-5">
            <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>📭</div>
            <h5 className="fw-bold mb-2" style={{ color: darkMode ? "#e0e0e0" : "#1a1a1a" }}>
              Ainda não recebeu candidaturas
            </h5>
            <p className="text-muted mb-4">
              Quando um inquilino clicar em "Tenho interesse" num dos seus imóveis, o currículo aparecerá aqui.
            </p>
            <Link to="/meus-imoveis" className="btn btn-warning fw-semibold" style={{ borderRadius: 10 }}>
              Ver os meus imóveis
            </Link>
          </div>
        )}

        {!loading && !erro && Object.entries(porImovel).map(([imovelId, grupo]) => (
          <div key={imovelId} className="mb-5">
            {/* Cabeçalho do imóvel */}
            <div className="d-flex align-items-center gap-3 mb-3">
              <Link to={`/imoveis/${imovelId}`}
                className="fw-bold text-decoration-none"
                style={{ color: darkMode ? "#FFC300" : "#1a1a1a", fontSize: "1.05rem" }}>
                🏠 {grupo.titulo}
              </Link>
              <span className="badge" style={{ background: "rgba(255,195,0,0.15)", color: "#b8860b", fontSize: "0.75rem" }}>
                {grupo.tipologia}
              </span>
              <span className="badge" style={{ background: "#f0f0f0", color: "#555", fontSize: "0.75rem" }}>
                {Number(grupo.preco).toLocaleString("pt-PT")} €/mês
              </span>
              <span className="text-muted" style={{ fontSize: "0.8rem" }}>
                {grupo.lista.length} candidatura{grupo.lista.length !== 1 ? "s" : ""}
              </span>
            </div>

            <div className="d-flex flex-column gap-3">
              {grupo.lista.map((c) => (
                <div key={c.id}
                  style={{
                    background: darkMode ? "#1e1e1e" : "#fff",
                    borderRadius: 14,
                    boxShadow: "0 2px 10px rgba(0,0,0,0.07)",
                    border: !c.lida ? "2px solid #FFC300" : `1.5px solid ${darkMode ? "#333" : "#e0e0e0"}`,
                    overflow: "hidden",
                    transition: "box-shadow 0.2s",
                  }}
                >
                  {/* Linha de resumo — sempre visível */}
                  <button
                    className="w-100 text-start p-0 border-0"
                    style={{ background: "transparent" }}
                    onClick={() => handleExpandir(c)}
                  >
                    <div className="d-flex align-items-center gap-3 px-4 py-3">
                      {/* Avatar */}
                      {c.inquilino_foto ? (
                        <img src={c.inquilino_foto} alt={c.inquilino_nome}
                          style={{ width: 46, height: 46, borderRadius: "50%", objectFit: "cover", flexShrink: 0, border: "2px solid #FFC300" }} />
                      ) : (
                        <div style={{
                          width: 46, height: 46, borderRadius: "50%", flexShrink: 0,
                          background: "#FFC300", color: "#1a1a1a",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontWeight: "bold", fontSize: "1.1rem",
                        }}>
                          {c.inquilino_nome?.[0]?.toUpperCase() || "?"}
                        </div>
                      )}

                      {/* Nome + mini-info */}
                      <div className="flex-grow-1" style={{ minWidth: 0 }}>
                        <div className="d-flex align-items-center gap-2 flex-wrap">
                          <span className="fw-bold" style={{ color: darkMode ? "#e0e0e0" : "#1a1a1a", fontSize: "0.95rem" }}>
                            {c.inquilino_nome}
                          </span>
                          {!c.lida && (
                            <span className="badge" style={{ background: "#FFC300", color: "#1a1a1a", fontSize: "0.65rem" }}>
                              Novo
                            </span>
                          )}
                        </div>
                        <div className="text-muted" style={{ fontSize: "0.78rem" }}>
                          {c.situacao_profissional || "—"}{c.tipo_contrato ? ` · ${c.tipo_contrato}` : ""}{c.profissao ? ` · ${c.profissao}` : ""}
                        </div>
                      </div>

                      {/* Data + seta */}
                      <div className="d-flex align-items-center gap-3 flex-shrink-0">
                        <span className="text-muted" style={{ fontSize: "0.75rem" }}>
                          {tempoRelativo(c.criado_em)}
                        </span>
                        <span style={{ color: "#aaa", fontSize: "1.1rem", transition: "transform 0.2s", transform: expandido === c.id ? "rotate(90deg)" : "rotate(0deg)" }}>
                          ›
                        </span>
                      </div>
                    </div>
                  </button>

                  {/* Detalhe expandido — currículo completo */}
                  {expandido === c.id && (
                    <div style={{ borderTop: `1px solid ${darkMode ? "#333" : "#f0f0f0"}`, padding: "1.5rem" }}>
                      {/* Badges rápidos */}
                      <div className="mb-3">
                        {c.num_pessoas && <BadgeInfo icon="👥" label={`${c.num_pessoas} pessoa${c.num_pessoas !== 1 ? "s" : ""}`} />}
                        {c.duracao_pretendida && <BadgeInfo icon="📅" label={c.duracao_pretendida} />}
                        {c.rendimento_mensal && <BadgeInfo icon="💰" label={`${Number(c.rendimento_mensal).toLocaleString("pt-PT")} €/mês`} />}
                        {c.tem_animais ? <BadgeInfo icon="🐾" label="Tem animais" /> : <BadgeInfo icon="🐾" label="Sem animais" />}
                      </div>

                      {/* Sobre mim */}
                      {c.sobre_mim && (
                        <div className="mb-3 p-3"
                          style={{ background: darkMode ? "#2a2a2a" : "#f8f9fa", borderRadius: 10, borderLeft: "3px solid #FFC300" }}>
                          <div className="fw-semibold mb-1" style={{ fontSize: "0.8rem", color: "#FFC300", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                            Apresentação
                          </div>
                          <p className="mb-0" style={{ fontSize: "0.88rem", color: darkMode ? "#ccc" : "#444", whiteSpace: "pre-line", lineHeight: 1.6 }}>
                            {c.sobre_mim}
                          </p>
                        </div>
                      )}

                      {/* Referências */}
                      {c.referencias && (
                        <div className="mb-3 p-3"
                          style={{ background: darkMode ? "#2a2a2a" : "#f8f9fa", borderRadius: 10 }}>
                          <div className="fw-semibold mb-1" style={{ fontSize: "0.8rem", color: darkMode ? "#aaa" : "#666", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                            🤝 Referências
                          </div>
                          <p className="mb-0" style={{ fontSize: "0.85rem", color: darkMode ? "#ccc" : "#444", whiteSpace: "pre-line" }}>
                            {c.referencias}
                          </p>
                        </div>
                      )}

                      {/* Contactos */}
                      <div className="d-flex gap-2 flex-wrap">
                        <a href={`mailto:${c.inquilino_email}`}
                          className="btn btn-sm fw-semibold"
                          style={{ background: "#1a1a1a", color: "#fff", borderRadius: 8, fontSize: "0.83rem" }}>
                          ✉️ {c.inquilino_email}
                        </a>
                        {c.inquilino_telefone && (
                          <>
                            <a href={`tel:${c.inquilino_telefone}`}
                              className="btn btn-sm fw-semibold"
                              title="Ligar"
                              style={{ background: "#444", color: "#fff", borderRadius: 8, fontSize: "0.83rem" }}>
                              📞 {c.inquilino_telefone}
                            </a>
                            <a
                              href={`https://wa.me/${c.inquilino_telefone.replace(/\D/g, "").replace(/^00/, "").replace(/^0/, "351")}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-sm fw-semibold d-flex align-items-center gap-2"
                              title="Abrir conversa no WhatsApp"
                              style={{ background: "#25D366", color: "#fff", borderRadius: 8, fontSize: "0.83rem" }}>
                              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="white">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                              </svg>
                              WhatsApp
                            </a>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
