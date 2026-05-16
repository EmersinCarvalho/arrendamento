import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Loading from "../components/Loading";
import { getImovelById, getAvaliacoesAnunciante } from "../services/api";

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
      <span className="fw-semibold" style={{ fontSize: "0.88rem", color: "#1a1a1a" }}>{valor}</span>
    </div>
  );
}

export default function DetalheImovel() {
  const { id } = useParams();
  const [imovel, setImovel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);
  const [statsAnunciante, setStatsAnunciante] = useState(null);

  useEffect(() => {
    getImovelById(id)
      .then((data) => {
        setImovel(data);
        if (data.utilizador_id) {
          getAvaliacoesAnunciante(data.utilizador_id)
            .then((r) => setStatsAnunciante(r.stats))
            .catch(() => {});
        }
      })
      .catch(() => setErro("Imóvel não encontrado."))
      .finally(() => setLoading(false));
  }, [id]);

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
    imovel.aquecimento || imovel.tipo_edificio || imovel.andar || imovel.certificado_energetico;

  return (
    <div style={{ minHeight: "100vh", background: "#f8f9fa" }}>
      <div className="container py-5">
        <Link to="/imoveis" className="btn btn-outline-secondary btn-sm mb-4">
          ← Voltar
        </Link>

        <div className="row g-4">
          {/* Coluna esquerda: foto + características */}
          <div className="col-12 col-lg-7">
            {/* Foto */}
            <div style={{ borderRadius: 16, overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}>
              {imovel.foto ? (
                <img src={imovel.foto} alt={imovel.titulo}
                  className="w-100" style={{ maxHeight: 420, objectFit: "cover", display: "block" }} />
              ) : (
                <div className="d-flex align-items-center justify-content-center bg-light"
                  style={{ height: 300, fontSize: "4rem", color: "#ccc" }}>🏠</div>
              )}
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

            {/* Características Adicionais */}
            <div className="mt-4 p-4"
              style={{ background: "#fff", borderRadius: 16, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
              <h6 className="fw-bold mb-3" style={{ color: "#1a1a1a" }}>✨ Características Adicionais</h6>
              <div className="d-flex flex-column gap-2">
                {[
                  { cond: imovel.aceita_pets,       icon: "🐾", label: "Aceita animais de estimação" },
                  { cond: imovel.mobiliado,          icon: "🛋️", label: "Mobilado" },
                  { cond: imovel.despesas_incluidas, icon: "💡", label: "Despesas incluídas" },
                  { cond: imovel.disponivel,         icon: "✅", label: "Disponível para arrendamento" },
                ].map(({ cond, icon, label }) => (
                  <div key={label} className="d-flex align-items-center gap-2 px-3 py-2"
                    style={{
                      borderRadius: 10,
                      background: cond ? "rgba(255,195,0,0.08)" : "#f5f5f5",
                      border: `1.5px solid ${cond ? "#FFC300" : "#e0e0e0"}`,
                      opacity: cond ? 1 : 0.5,
                    }}>
                    <span style={{ fontSize: "1.1rem" }}>{icon}</span>
                    <span className="fw-semibold" style={{ fontSize: "0.9rem", color: cond ? "#1a1a1a" : "#999" }}>
                      {label}
                    </span>
                    {!cond && (
                      <span className="ms-auto" style={{ color: "#dc3545", fontSize: "1rem", fontWeight: "bold" }}>✕</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

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
                <Detalhe icon="🔥" label="Aquecimento" valor={imovel.aquecimento} />
                <Detalhe icon="🏢" label="Tipo de edifício" valor={imovel.tipo_edificio} />
                <Detalhe icon="🛗" label="Andar" valor={imovel.andar} />
                <Detalhe icon="🛗" label="Elevador" valor={imovel.elevador ? "Sim" : (imovel.andar ? "Não" : null)} />

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
          </div>

          {/* Coluna direita: preço, extras, senhorio, CTA */}
          <div className="col-12 col-lg-5">
            <div style={{ position: "sticky", top: 80 }}>
              <div className="d-flex gap-2 mb-3">
                <span className="badge bg-warning text-dark fs-6">{imovel.tipologia}</span>
                <span className="badge bg-dark fs-6">{imovel.cidade}</span>
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

              {imovel.descricao && <p className="text-muted mb-4">{imovel.descricao}</p>}

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

              {/* Condições de Entrada */}
              {(imovel.meses_caucao || imovel.fianca) && (
                <div className="mb-4 p-4"
                  style={{ background: "#fff8e1", borderRadius: 14, border: "1.5px solid #FFC300" }}>
                  <h6 className="fw-bold mb-3" style={{ color: "#1a1a1a" }}>🔐 Condições de Entrada</h6>
                  <div className="d-flex flex-column gap-2">
                    {imovel.meses_caucao && (
                      <>
                        <div className="d-flex justify-content-between align-items-center">
                          <span className="text-muted" style={{ fontSize: "0.85rem" }}>💰 Caução</span>
                          <span className="fw-bold">
                            {imovel.meses_caucao} {imovel.meses_caucao === 1 ? "mês" : "meses"} de renda
                          </span>
                        </div>
                        <div className="d-flex justify-content-between align-items-center">
                          <span className="text-muted" style={{ fontSize: "0.85rem" }}>📊 Valor da caução</span>
                          <span className="fw-bold" style={{ color: "#b8860b" }}>
                            {(Number(imovel.preco) * imovel.meses_caucao).toLocaleString("pt-PT")} €
                          </span>
                        </div>
                        <div className="d-flex justify-content-between align-items-center pt-2"
                          style={{ borderTop: "1px dashed #FFC300" }}>
                          <span className="fw-semibold" style={{ fontSize: "0.88rem" }}>💵 Total entrada estimado</span>
                          <span className="fw-bold fs-6" style={{ color: "#b8860b" }}>
                            {(Number(imovel.preco) * (imovel.meses_caucao + 1)).toLocaleString("pt-PT")} €
                          </span>
                        </div>
                        <div className="text-muted" style={{ fontSize: "0.75rem" }}>
                          * Caução ({imovel.meses_caucao}×{Number(imovel.preco).toLocaleString("pt-PT")} €) + 1.º mês de renda
                        </div>
                      </>
                    )}
                    {imovel.fianca && (
                      <div className="d-flex align-items-center gap-2 mt-1 pt-2"
                        style={{ borderTop: imovel.meses_caucao ? "none" : undefined }}>
                        <span>🤝</span>
                        <span className="fw-semibold" style={{ fontSize: "0.88rem" }}>Fiança obrigatória</span>
                        <span className="text-muted" style={{ fontSize: "0.78rem" }}>(fiador exigido)</span>
                      </div>
                    )}
                  </div>
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

              <button className="btn btn-warning btn-lg w-100 fw-semibold">
                Pedir informações
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

