import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { salvarPerfilProcura, getPerfilProcura } from "../services/procura";
import { getUtilizador } from "../services/auth";
import logo from "../assets/logo.png";

const TIPOLOGIAS = ["T0", "T1", "T2", "T3", "T4", "T4+"];
const TIPOS_IMOVEL = [
  { valor: "apartamento", icon: "🏢", label: "Apartamento" },
  { valor: "casa", icon: "🏡", label: "Casa" },
  { valor: "quarto", icon: "🛏️", label: "Quarto" },
  { valor: "estudio", icon: "🏠", label: "Estúdio" },
];
const PRIORIDADES = [
  { valor: "preco", icon: "💰", label: "Preço" },
  { valor: "localizacao", icon: "📍", label: "Localização" },
  { valor: "tamanho", icon: "📐", label: "Tamanho" },
  { valor: "modernidade", icon: "✨", label: "Modernidade" },
  { valor: "transporte", icon: "🚇", label: "Transporte" },
];
const CIDADES_RAPIDAS = ["Lisboa", "Porto", "Braga", "Coimbra", "Faro", "Setúbal", "Aveiro", "Funchal"];

export default function SetupProcura() {
  const navigate = useNavigate();
  const utilizador = getUtilizador();
  const [loading, setLoading] = useState(false);
  const [guardado, setGuardado] = useState(false);
  const [dados, setDados] = useState({
    objetivo: null,
    tipo_imovel: [],
    cidade: "",
    tipologia: null,
    preco_max: 1200,
    quartos_min: 0,
    aceita_pets: false,
    mobiliado: false,
    despesas_incluidas: false,
    prioridades: [],
  });

  if (!utilizador) { navigate("/login"); return null; }

  useEffect(() => {
    getPerfilProcura().then((p) => {
      if (p) setDados((prev) => ({ ...prev, ...p }));
    }).catch(() => {});
  }, []);

  function set(campo, valor) {
    setDados((prev) => ({ ...prev, [campo]: valor }));
  }

  function toggleTipoImovel(valor) {
    setDados((prev) => {
      const arr = prev.tipo_imovel || [];
      return {
        ...prev,
        tipo_imovel: arr.includes(valor)
          ? arr.filter((x) => x !== valor)
          : [...arr, valor],
      };
    });
  }

  function togglePrioridade(valor) {
    setDados((prev) => {
      const p = prev.prioridades;
      return {
        ...prev,
        prioridades: p.includes(valor)
          ? p.filter((x) => x !== valor)
          : p.length < 3 ? [...p, valor] : p,
      };
    });
  }

  async function guardar(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await salvarPerfilProcura(dados);
      setGuardado(true);
      setTimeout(() => navigate("/imoveis"), 1200);
    } catch {
      alert("Erro ao guardar. Verifique a sua ligação e tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container py-5" style={{ maxWidth: 760 }}>
      <div className="d-flex align-items-center gap-3 mb-5">
        <img src={logo} alt="ArrendaHouse" style={{ height: 48, borderRadius: 10 }} />
        <div>
          <h2 className="fw-bold mb-0" style={{ fontSize: "1.6rem" }}>Preferências de Procura</h2>
          <p className="text-muted mb-0 small">Configure o seu perfil para receber sugestões personalizadas</p>
        </div>
      </div>

      <form onSubmit={guardar}>

        {/* Objetivo */}
        <div className="card border-0 shadow-sm rounded-4 mb-4 p-4">
          <h6 className="fw-bold text-uppercase text-muted small mb-3" style={{ letterSpacing: "0.8px" }}>O que procura?</h6>
          <div className="d-flex gap-3 flex-wrap">
            {[
              { valor: "arrendar", icon: "🏠", label: "Arrendar", sub: "Alugar um imóvel" },
              { valor: "comprar", icon: "🔑", label: "Comprar", sub: "Adquirir um imóvel" },
            ].map((op) => (
              <div
                key={op.valor}
                onClick={() => set("objetivo", op.valor)}
                className="d-flex align-items-center gap-3 rounded-3 px-4 py-3"
                style={{
                  border: `2px solid ${dados.objetivo === op.valor ? "#FFC300" : "#e0e0e0"}`,
                  background: dados.objetivo === op.valor ? "rgba(255,195,0,0.08)" : "#fff",
                  cursor: "pointer", transition: "all 0.2s", flex: "1 1 180px",
                }}
              >
                <span style={{ fontSize: "1.8rem" }}>{op.icon}</span>
                <div>
                  <div className="fw-bold">{op.label}</div>
                  <div className="text-muted" style={{ fontSize: "0.8rem" }}>{op.sub}</div>
                </div>
                {dados.objetivo === op.valor && (
                  <span className="ms-auto" style={{ color: "#FFC300", fontSize: "1.2rem" }}>✓</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Tipo de imóvel */}
        <div className="card border-0 shadow-sm rounded-4 mb-4 p-4">
          <h6 className="fw-bold text-uppercase text-muted small mb-3" style={{ letterSpacing: "0.8px" }}>Tipo de imóvel</h6>
          <div className="d-flex gap-3 flex-wrap">
            {TIPOS_IMOVEL.map((t) => (
              <div
                key={t.valor}
                onClick={() => toggleTipoImovel(t.valor)}
                className="text-center rounded-3 py-3 px-3"
                style={{
                  border: `2px solid ${(dados.tipo_imovel || []).includes(t.valor) ? "#FFC300" : "#e0e0e0"}`,
                  background: (dados.tipo_imovel || []).includes(t.valor) ? "rgba(255,195,0,0.08)" : "#fff",
                  cursor: "pointer", transition: "all 0.2s", flex: "1 1 110px",
                }}
              >
                <div style={{ fontSize: "2rem" }}>{t.icon}</div>
                <div className="fw-semibold mt-1" style={{ fontSize: "0.9rem" }}>{t.label}</div>
                {(dados.tipo_imovel || []).includes(t.valor) && (
                  <div style={{ color: "#FFC300", fontWeight: "bold", marginTop: 4, fontSize: "0.85rem" }}>✓</div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Localização + Tipologia */}
        <div className="card border-0 shadow-sm rounded-4 mb-4 p-4">
          <h6 className="fw-bold text-uppercase text-muted small mb-3" style={{ letterSpacing: "0.8px" }}>Localização & Tipologia</h6>
          <div className="row g-4">
            <div className="col-12 col-md-6">
              <label className="form-label fw-semibold small">Cidade ou região</label>
              <input
                type="text"
                className="form-control mb-2"
                placeholder="Ex: Lisboa, Porto..."
                value={dados.cidade}
                onChange={(e) => set("cidade", e.target.value)}
              />
              <div className="d-flex flex-wrap gap-2">
                {CIDADES_RAPIDAS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => set("cidade", dados.cidade === c ? "" : c)}
                    className="btn btn-sm rounded-pill"
                    style={{
                      background: dados.cidade === c ? "#FFC300" : "rgba(0,0,0,0.05)",
                      color: dados.cidade === c ? "#1a1a1a" : "#555",
                      border: "none", fontWeight: 500, fontSize: "0.8rem",
                    }}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
            <div className="col-12 col-md-6">
              <label className="form-label fw-semibold small">Tipologia preferida</label>
              <div className="d-flex flex-wrap gap-2">
                {TIPOLOGIAS.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => set("tipologia", dados.tipologia === t ? null : t)}
                    className="btn btn-sm fw-bold"
                    style={{
                      background: dados.tipologia === t ? "#1a1a1a" : "rgba(0,0,0,0.05)",
                      color: dados.tipologia === t ? "#fff" : "#555",
                      border: "none", borderRadius: 8, minWidth: 52,
                    }}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <small className="text-muted d-block mt-2">Sem seleção = qualquer tipologia</small>
            </div>
          </div>
        </div>

        {/* Orçamento */}
        <div className="card border-0 shadow-sm rounded-4 mb-4 p-4">
          <h6 className="fw-bold text-uppercase text-muted small mb-3" style={{ letterSpacing: "0.8px" }}>Orçamento máximo mensal</h6>
          <div className="d-flex align-items-center gap-4 mb-3 flex-wrap">
            <div
              className="rounded-3 px-4 py-3 text-center"
              style={{ background: "rgba(255,195,0,0.10)", border: "2px solid rgba(255,195,0,0.3)", minWidth: 140 }}
            >
              <div className="text-muted small">Máximo</div>
              <div className="fw-bold" style={{ fontSize: "2rem", color: "#c4900a" }}>
                €{dados.preco_max.toLocaleString()}
              </div>
              <div className="text-muted small">/mês</div>
            </div>
            <div className="flex-grow-1" style={{ minWidth: 200 }}>
              <input
                type="range"
                className="form-range"
                min={200} max={5000} step={50}
                value={dados.preco_max}
                onChange={(e) => set("preco_max", Number(e.target.value))}
                style={{ accentColor: "#FFC300" }}
              />
              <div className="d-flex justify-content-between text-muted" style={{ fontSize: "0.78rem" }}>
                <span>€200</span><span>€5.000</span>
              </div>
            </div>
          </div>
          <div className="d-flex flex-wrap gap-2">
            {[600, 900, 1200, 1500, 2000, 3000].map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => set("preco_max", v)}
                className="btn btn-sm rounded-pill"
                style={{
                  background: dados.preco_max === v ? "#FFC300" : "rgba(0,0,0,0.05)",
                  color: dados.preco_max === v ? "#1a1a1a" : "#555",
                  border: "none", fontWeight: 500,
                }}
              >
                €{v}
              </button>
            ))}
          </div>
        </div>

        {/* Requisitos */}
        <div className="card border-0 shadow-sm rounded-4 mb-4 p-4">
          <h6 className="fw-bold text-uppercase text-muted small mb-3" style={{ letterSpacing: "0.8px" }}>Requisitos</h6>
          <div className="row g-3">
            {[
              { campo: "aceita_pets", icon: "🐾", label: "Aceita animais", sub: "O imóvel deve aceitar pets" },
              { campo: "mobiliado", icon: "🛋️", label: "Mobilado", sub: "Quero o imóvel mobilado" },
              { campo: "despesas_incluidas", icon: "💡", label: "Despesas incluídas", sub: "Água, luz e gás no preço" },
            ].map((item) => (
              <div key={item.campo} className="col-12 col-sm-4">
                <div
                  onClick={() => set(item.campo, !dados[item.campo])}
                  className="rounded-3 p-3 h-100"
                  style={{
                    border: `2px solid ${dados[item.campo] ? "#FFC300" : "#e0e0e0"}`,
                    background: dados[item.campo] ? "rgba(255,195,0,0.08)" : "#fff",
                    cursor: "pointer", transition: "all 0.2s",
                  }}
                >
                  <div className="d-flex align-items-center gap-2 mb-1">
                    <span style={{ fontSize: "1.4rem" }}>{item.icon}</span>
                    <span className="fw-semibold">{item.label}</span>
                    {dados[item.campo] && (
                      <span className="ms-auto" style={{ color: "#FFC300", fontWeight: "bold" }}>✓</span>
                    )}
                  </div>
                  <small className="text-muted">{item.sub}</small>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Prioridades */}
        <div className="card border-0 shadow-sm rounded-4 mb-5 p-4">
          <h6 className="fw-bold text-uppercase text-muted small mb-1" style={{ letterSpacing: "0.8px" }}>O que valoriza mais?</h6>
          <small className="text-muted d-block mb-3">Escolha até 3 prioridades</small>
          <div className="d-flex flex-wrap gap-2">
            {PRIORIDADES.map((p) => {
              const pos = dados.prioridades.indexOf(p.valor);
              const sel = pos !== -1;
              return (
                <button
                  key={p.valor}
                  type="button"
                  onClick={() => togglePrioridade(p.valor)}
                  className="btn d-flex align-items-center gap-2 px-3 py-2"
                  style={{
                    border: `2px solid ${sel ? "#1a1a1a" : "#e0e0e0"}`,
                    background: sel ? "#1a1a1a" : "#fff",
                    color: sel ? "#fff" : "#555",
                    borderRadius: 10, fontWeight: 500, transition: "all 0.2s",
                  }}
                >
                  <span>{p.icon}</span>
                  <span>{p.label}</span>
                  {sel && (
                    <span
                      style={{
                        background: "#FFC300", color: "#1a1a1a",
                        borderRadius: "50%", width: 20, height: 20,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "0.72rem", fontWeight: "bold", flexShrink: 0,
                      }}
                    >
                      {pos + 1}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Botões */}
        <div className="d-flex justify-content-end gap-3">
          <button type="button" className="btn btn-outline-secondary px-4" onClick={() => navigate(-1)}>
            Cancelar
          </button>
          <button
            type="submit"
            className="btn fw-bold px-5 py-2"
            style={{
              background: guardado ? "#28a745" : "#1a1a1a",
              color: "#fff", border: "none", borderRadius: 10,
              transition: "background 0.3s",
            }}
            disabled={loading}
          >
            {loading ? (
              <><span className="spinner-border spinner-border-sm me-2" />A guardar...</>
            ) : guardado ? (
              "✓ Guardado!"
            ) : (
              "Guardar preferências"
            )}
          </button>
        </div>

      </form>
    </div>
  );
}
