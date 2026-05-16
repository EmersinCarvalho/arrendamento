import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { salvarPerfilProcura } from "../services/procura";
import { getUtilizador } from "../services/auth";
import logo from "../assets/logo.png";

const PASSOS = [
  { id: 1, titulo: "O que procura?", sub: "Escolha o seu objetivo principal" },
  { id: 2, titulo: "Tipo de imóvel", sub: "Que tipo de espaço imagina?" },
  { id: 3, titulo: "Onde quer viver?", sub: "Cidade ou região preferida" },
  { id: 4, titulo: "Quantas divisões?", sub: "Selecione a tipologia ideal" },
  { id: 5, titulo: "Qual o seu orçamento?", sub: "Defina o valor máximo mensal" },
  { id: 6, titulo: "O que precisa?", sub: "Requisitos essenciais para si" },
  { id: 7, titulo: "O que valoriza mais?", sub: "As suas prioridades na procura" },
];

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
  const [passo, setPasso] = useState(1);
  const [loading, setLoading] = useState(false);
  const [dados, setDados] = useState({
    objetivo: null,
    tipo_imovel: null,
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

  function set(campo, valor) {
    setDados((prev) => ({ ...prev, [campo]: valor }));
  }

  function podeAvancar() {
    if (passo === 1) return !!dados.objetivo;
    if (passo === 2) return !!dados.tipo_imovel;
    if (passo === 3) return dados.cidade.trim().length >= 2;
    return true;
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

  async function finalizar() {
    setLoading(true);
    try {
      await salvarPerfilProcura(dados);
      navigate("/descobrir");
    } catch {
      alert("Erro ao guardar. Verifique a sua ligação e tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  function avancar() {
    if (passo < 7) setPasso((p) => p + 1);
    else finalizar();
  }

  const progresso = ((passo - 1) / 6) * 100;
  const passoInfo = PASSOS[passo - 1];

  return (
    <div style={{ minHeight: "100vh", background: "#1a1a1a", display: "flex", flexDirection: "column" }}>
      {/* ── Header / Progresso ── */}
      <div style={{ background: "#111", padding: "1rem 1.5rem", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ maxWidth: 500, margin: "0 auto" }}>
          <div className="d-flex align-items-center justify-content-between mb-3">
            <img src={logo} alt="ArrendaHouse" style={{ height: 32, borderRadius: 6 }} />
            <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.8rem" }}>
              {passo} / 7
            </span>
          </div>
          <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: 10, height: 6, overflow: "hidden" }}>
            <div
              style={{
                height: "100%",
                width: `${progresso}%`,
                background: "linear-gradient(90deg, #FFC300, #ffad00)",
                borderRadius: 10,
                transition: "width 0.4s ease",
              }}
            />
          </div>
        </div>
      </div>

      {/* ── Conteúdo do Passo ── */}
      <div style={{ flex: 1, overflowY: "auto", padding: "2rem 1.5rem" }}>
        <div style={{ maxWidth: 500, margin: "0 auto" }}>
          <div className="mb-4">
            <h2 className="fw-bold text-white mb-1" style={{ fontSize: "1.7rem" }}>
              {passoInfo.titulo}
            </h2>
            <p style={{ color: "rgba(255,255,255,0.45)", marginBottom: 0 }}>{passoInfo.sub}</p>
          </div>

          {/* ── Passo 1: Objetivo ── */}
          {passo === 1 && (
            <div className="row g-3">
              {[
                { valor: "arrendar", icon: "🏠", label: "Arrendar", sub: "Procuro casa para alugar" },
                { valor: "comprar", icon: "🔑", label: "Comprar", sub: "Quero adquirir um imóvel" },
              ].map((op) => (
                <div key={op.valor} className="col-6">
                  <div
                    onClick={() => set("objetivo", op.valor)}
                    style={{
                      background: dados.objetivo === op.valor ? "rgba(255,195,0,0.15)" : "rgba(255,255,255,0.04)",
                      border: `2px solid ${dados.objetivo === op.valor ? "#FFC300" : "rgba(255,255,255,0.08)"}`,
                      borderRadius: 16, padding: "2rem 1rem",
                      textAlign: "center", cursor: "pointer", transition: "all 0.2s",
                    }}
                  >
                    <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>{op.icon}</div>
                    <div className="fw-bold text-white" style={{ fontSize: "1.1rem" }}>{op.label}</div>
                    <div style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.8rem", marginTop: 4 }}>{op.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── Passo 2: Tipo de imóvel ── */}
          {passo === 2 && (
            <div className="row g-3">
              {TIPOS_IMOVEL.map((t) => (
                <div key={t.valor} className="col-6">
                  <div
                    onClick={() => set("tipo_imovel", t.valor)}
                    style={{
                      background: dados.tipo_imovel === t.valor ? "rgba(255,195,0,0.15)" : "rgba(255,255,255,0.04)",
                      border: `2px solid ${dados.tipo_imovel === t.valor ? "#FFC300" : "rgba(255,255,255,0.08)"}`,
                      borderRadius: 16, padding: "1.75rem 1rem",
                      textAlign: "center", cursor: "pointer", transition: "all 0.2s",
                    }}
                  >
                    <div style={{ fontSize: "2.2rem", marginBottom: "0.6rem" }}>{t.icon}</div>
                    <div className="fw-semibold text-white">{t.label}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── Passo 3: Cidade ── */}
          {passo === 3 && (
            <>
              <input
                type="text"
                className="form-control form-control-lg mb-3"
                placeholder="Escreva uma cidade ou região..."
                value={dados.cidade}
                onChange={(e) => set("cidade", e.target.value)}
                style={{
                  background: "rgba(255,255,255,0.06)", border: "2px solid rgba(255,255,255,0.12)",
                  color: "#fff", borderRadius: 12,
                }}
                autoFocus
              />
              <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.8rem", marginBottom: "0.75rem" }}>
                Ou escolha rapidamente:
              </p>
              <div className="d-flex flex-wrap gap-2">
                {CIDADES_RAPIDAS.map((c) => (
                  <button
                    key={c}
                    onClick={() => set("cidade", c)}
                    className="btn btn-sm"
                    style={{
                      background: dados.cidade === c ? "#FFC300" : "rgba(255,255,255,0.07)",
                      color: dados.cidade === c ? "#1a1a1a" : "rgba(255,255,255,0.7)",
                      border: "none", borderRadius: 20, fontWeight: 500,
                    }}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </>
          )}

          {/* ── Passo 4: Tipologia ── */}
          {passo === 4 && (
            <>
              <div className="d-flex flex-wrap gap-3 mb-3">
                {TIPOLOGIAS.map((t) => (
                  <div
                    key={t}
                    onClick={() => set("tipologia", dados.tipologia === t ? null : t)}
                    style={{
                      background: dados.tipologia === t ? "#FFC300" : "rgba(255,255,255,0.06)",
                      border: `2px solid ${dados.tipologia === t ? "#FFC300" : "rgba(255,255,255,0.1)"}`,
                      color: dados.tipologia === t ? "#1a1a1a" : "#fff",
                      borderRadius: 12, padding: "0.9rem 1.4rem",
                      fontWeight: "bold", fontSize: "1.05rem",
                      cursor: "pointer", transition: "all 0.2s", minWidth: 70, textAlign: "center",
                    }}
                  >
                    {t}
                  </div>
                ))}
              </div>
              <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.8rem" }}>
                Sem seleção = aceita qualquer tipologia
              </p>
            </>
          )}

          {/* ── Passo 5: Orçamento ── */}
          {passo === 5 && (
            <>
              <div
                className="text-center mb-4 py-4 rounded-4"
                style={{ background: "rgba(255,195,0,0.08)", border: "2px solid rgba(255,195,0,0.2)" }}
              >
                <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.85rem", marginBottom: 4 }}>
                  Máximo mensal
                </div>
                <div style={{ fontSize: "2.8rem", fontWeight: "bold", color: "#FFC300" }}>
                  €{dados.preco_max.toLocaleString()}
                </div>
                <div style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.8rem" }}>/mês</div>
              </div>
              <input
                type="range"
                className="form-range"
                min={200} max={5000} step={50}
                value={dados.preco_max}
                onChange={(e) => set("preco_max", Number(e.target.value))}
                style={{ accentColor: "#FFC300" }}
              />
              <div className="d-flex justify-content-between" style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.8rem" }}>
                <span>€200</span><span>€5.000</span>
              </div>

              <div className="d-flex flex-wrap gap-2 mt-4">
                {[600, 900, 1200, 1500, 2000, 3000].map((v) => (
                  <button
                    key={v}
                    onClick={() => set("preco_max", v)}
                    className="btn btn-sm"
                    style={{
                      background: dados.preco_max === v ? "#FFC300" : "rgba(255,255,255,0.07)",
                      color: dados.preco_max === v ? "#1a1a1a" : "rgba(255,255,255,0.6)",
                      border: "none", borderRadius: 20,
                    }}
                  >
                    €{v}
                  </button>
                ))}
              </div>
            </>
          )}

          {/* ── Passo 6: Extras ── */}
          {passo === 6 && (
            <div className="d-flex flex-column gap-3">
              {[
                { campo: "aceita_pets", icon: "🐾", label: "Aceita animais de estimação", sub: "O imóvel deve aceitar pets" },
                { campo: "mobiliado", icon: "🛋️", label: "Mobiliado", sub: "Quero o imóvel mobilado" },
                { campo: "despesas_incluidas", icon: "💡", label: "Despesas incluídas", sub: "Água, luz e gás no preço" },
              ].map((item) => (
                <div
                  key={item.campo}
                  onClick={() => set(item.campo, !dados[item.campo])}
                  style={{
                    background: dados[item.campo] ? "rgba(255,195,0,0.12)" : "rgba(255,255,255,0.04)",
                    border: `2px solid ${dados[item.campo] ? "#FFC300" : "rgba(255,255,255,0.08)"}`,
                    borderRadius: 14, padding: "1.2rem 1.4rem",
                    cursor: "pointer", transition: "all 0.2s",
                    display: "flex", alignItems: "center", gap: "1rem",
                  }}
                >
                  <span style={{ fontSize: "1.8rem" }}>{item.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div className="fw-semibold text-white">{item.label}</div>
                    <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.8rem" }}>{item.sub}</div>
                  </div>
                  <div
                    style={{
                      width: 26, height: 26, borderRadius: "50%",
                      background: dados[item.campo] ? "#FFC300" : "rgba(255,255,255,0.1)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "0.9rem", flexShrink: 0,
                    }}
                  >
                    {dados[item.campo] ? "✓" : ""}
                  </div>
                </div>
              ))}
              <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.78rem", marginTop: 4 }}>
                Pode saltar — escolha apenas o que é essencial.
              </p>
            </div>
          )}

          {/* ── Passo 7: Prioridades ── */}
          {passo === 7 && (
            <>
              <div className="d-flex flex-column gap-3">
                {PRIORIDADES.map((p, i) => {
                  const pos = dados.prioridades.indexOf(p.valor);
                  const selecionado = pos !== -1;
                  return (
                    <div
                      key={p.valor}
                      onClick={() => togglePrioridade(p.valor)}
                      style={{
                        background: selecionado ? "rgba(255,195,0,0.12)" : "rgba(255,255,255,0.04)",
                        border: `2px solid ${selecionado ? "#FFC300" : "rgba(255,255,255,0.08)"}`,
                        borderRadius: 14, padding: "1rem 1.4rem",
                        cursor: "pointer", transition: "all 0.2s",
                        display: "flex", alignItems: "center", gap: "1rem",
                      }}
                    >
                      <span style={{ fontSize: "1.6rem" }}>{p.icon}</span>
                      <span className="fw-semibold text-white" style={{ flex: 1 }}>{p.label}</span>
                      {selecionado && (
                        <span
                          style={{
                            background: "#FFC300", color: "#1a1a1a",
                            borderRadius: "50%", width: 26, height: 26,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontWeight: "bold", fontSize: "0.85rem",
                          }}
                        >
                          {pos + 1}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
              <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.78rem", marginTop: "0.75rem" }}>
                Selecione até 3 prioridades (opcional)
              </p>
            </>
          )}
        </div>
      </div>

      {/* ── Rodapé / Botões ── */}
      <div
        style={{
          background: "#111", padding: "1.25rem 1.5rem",
          borderTop: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div style={{ maxWidth: 500, margin: "0 auto", display: "flex", gap: "0.75rem" }}>
          {passo > 1 && (
            <button
              onClick={() => setPasso((p) => p - 1)}
              className="btn"
              style={{
                background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.7)",
                border: "none", borderRadius: 12, padding: "0.85rem 1.4rem", fontWeight: 500,
              }}
            >
              ← Voltar
            </button>
          )}
          <button
            onClick={avancar}
            disabled={!podeAvancar() || loading}
            className="btn"
            style={{
              flex: 1,
              background: podeAvancar() ? "#FFC300" : "rgba(255,195,0,0.3)",
              color: "#1a1a1a", border: "none", borderRadius: 12,
              padding: "0.85rem", fontWeight: "bold", fontSize: "1rem",
              cursor: podeAvancar() ? "pointer" : "not-allowed",
              transition: "all 0.2s",
            }}
          >
            {loading ? (
              <><span className="spinner-border spinner-border-sm me-2" />A guardar...</>
            ) : passo === 7 ? (
              "🚀 Começar a descobrir"
            ) : (
              "Próximo →"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
