import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getUtilizador, setToken, getToken, logout } from "../services/auth";
import logo from "../assets/logo.png";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function Perfil() {
  const navigate = useNavigate();
  const utilizador = getUtilizador();

  const [perfilEscolhido, setPerfilEscolhido] = useState(utilizador?.perfil || "inquilino");
  const [membroDesde, setMembroDesde] = useState(null);
  const [saving, setSaving] = useState(false);
  const [sucesso, setSucesso] = useState(false);

  useEffect(() => {
    if (!utilizador) { navigate("/login"); return; }
    // Buscar data de criação
    fetch(`${API}/api/auth/me`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.criado_em) setMembroDesde(new Date(d.criado_em));
      })
      .catch(() => {});
  }, []);

  if (!utilizador) return null;

  const primeiroNome = utilizador.nome?.split(" ")[0] || "Utilizador";
  const isSenhorio = perfilEscolhido === "senhorio";
  const mudou = perfilEscolhido !== utilizador.perfil;

  async function guardar() {
    setSaving(true);
    setSucesso(false);
    try {
      const res = await fetch(`${API}/api/auth/perfil`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ perfil: perfilEscolhido }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setToken(data.token);
      setSucesso(true);
      setTimeout(() => setSucesso(false), 3000);
    } catch {
      alert("Erro ao guardar. Tente novamente.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f8f9fa" }}>
      {/* ── Header dark ── */}
      <div
        style={{
          background: "linear-gradient(135deg, #1a1a1a 0%, #2c2c2c 100%)",
          padding: "3rem 0 3rem",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute", top: -80, right: -80,
            width: 300, height: 300, borderRadius: "50%",
            background: "rgba(255,195,0,0.06)", pointerEvents: "none",
          }}
        />
        <div className="container">
          <div className="d-flex align-items-center gap-4">
            {/* Avatar */}
            {utilizador.foto_url ? (
              <img
                src={utilizador.foto_url}
                alt={utilizador.nome}
                style={{
                  width: 80, height: 80, borderRadius: "50%",
                  objectFit: "cover", border: "4px solid #FFC300",
                  flexShrink: 0,
                }}
              />
            ) : (
              <div
                style={{
                  width: 80, height: 80, borderRadius: "50%",
                  background: "#FFC300", color: "#1a1a1a",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontWeight: "bold", fontSize: "2rem",
                  border: "4px solid rgba(255,195,0,0.4)", flexShrink: 0,
                }}
              >
                {utilizador.nome?.[0]?.toUpperCase()}
              </div>
            )}
            <div>
              <h1 className="fw-bold text-white mb-1" style={{ fontSize: "1.9rem" }}>
                {primeiroNome}
              </h1>
              <p style={{ color: "rgba(255,255,255,0.55)", marginBottom: 8 }}>
                {utilizador.email}
              </p>
              {membroDesde && (
                <span style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.8rem" }}>
                  Membro desde{" "}
                  {membroDesde.toLocaleDateString("pt-PT", { month: "long", year: "numeric" })}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Conteúdo ── */}
      <div className="container py-5">
        <div style={{ maxWidth: 640, margin: "0 auto" }}>

          {/* ── Tipo de conta ── */}
          <div className="rounded-4 shadow-sm p-4 mb-3" style={{ background: "#fff" }}>
            <div className="d-flex align-items-center gap-2 mb-1">
              <span style={{ fontSize: "1.1rem" }}>👤</span>
              <h5 className="fw-bold mb-0" style={{ color: "#1a1a1a" }}>Tipo de conta</h5>
            </div>
            <p className="text-muted mb-3" style={{ fontSize: "0.85rem" }}>
              Define como usa a plataforma. Pode alterar em qualquer altura.
            </p>

            <div className="row g-3 mb-3">
              {[
                { valor: "inquilino", icon: "🏠", label: "Inquilino", sub: "Procuro casa para arrendar ou comprar" },
                { valor: "senhorio", icon: "🔑", label: "Senhorio", sub: "Tenho imóveis para arrendar ou vender" },
              ].map((op) => (
                <div key={op.valor} className="col-6">
                  <div
                    onClick={() => setPerfilEscolhido(op.valor)}
                    style={{
                      border: `2px solid ${perfilEscolhido === op.valor ? "#FFC300" : "#e9ecef"}`,
                      background: perfilEscolhido === op.valor ? "rgba(255,195,0,0.07)" : "#fafafa",
                      borderRadius: 14, padding: "1.25rem 1rem",
                      textAlign: "center", cursor: "pointer", transition: "all 0.2s",
                    }}
                  >
                    <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>{op.icon}</div>
                    <div className="fw-bold" style={{ color: "#1a1a1a", fontSize: "0.95rem" }}>{op.label}</div>
                    <div style={{ color: "#999", fontSize: "0.75rem", marginTop: 4, lineHeight: 1.3 }}>{op.sub}</div>
                  </div>
                </div>
              ))}
            </div>

            {mudou && (
              <button
                onClick={guardar}
                disabled={saving}
                className="btn fw-bold px-4 py-2 w-100 rounded-3"
                style={{ background: "#FFC300", color: "#1a1a1a", border: "none" }}
              >
                {saving
                  ? <><span className="spinner-border spinner-border-sm me-2" />A guardar...</>
                  : "Guardar alteração"}
              </button>
            )}
            {sucesso && (
              <div className="alert alert-success py-2 px-3 mt-2 mb-0 rounded-3" style={{ fontSize: "0.85rem" }}>
                ✅ Perfil atualizado com sucesso!
              </div>
            )}
          </div>

          {/* ── Preferências de procura (só inquilino) ── */}
          {perfilEscolhido === "inquilino" && (
            <div
              className="rounded-4 shadow-sm p-4 mb-3 d-flex align-items-center justify-content-between gap-3"
              style={{ background: "#fff" }}
            >
              <div className="d-flex align-items-center gap-3" style={{ minWidth: 0 }}>
                <div
                  style={{
                    width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                    background: "rgba(255,195,0,0.12)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "1.3rem",
                  }}
                >
                  🔍
                </div>
                <div style={{ minWidth: 0 }}>
                  <div className="fw-bold" style={{ color: "#1a1a1a", fontSize: "0.95rem" }}>
                    Preferências de procura
                  </div>
                  <div className="text-muted text-truncate" style={{ fontSize: "0.8rem" }}>
                    Cidade, orçamento, tipologia e extras
                  </div>
                </div>
              </div>
              <Link
                to="/setup-procura"
                className="btn fw-semibold flex-shrink-0"
                style={{
                  background: "#1a1a1a", color: "#FFC300",
                  border: "none", borderRadius: 10, padding: "0.55rem 1.1rem", fontSize: "0.875rem",
                }}
              >
                Editar
              </Link>
            </div>
          )}

          {/* ── Descobrir imóveis (só inquilino) ── */}
          {perfilEscolhido === "inquilino" && (
            <div
              className="rounded-4 shadow-sm p-4 mb-3 d-flex align-items-center justify-content-between gap-3"
              style={{ background: "linear-gradient(135deg, #1a1a1a 0%, #2c2c2c 100%)" }}
            >
              <div className="d-flex align-items-center gap-3" style={{ minWidth: 0 }}>
                <div
                  style={{
                    width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                    background: "rgba(255,195,0,0.15)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "1.3rem",
                  }}
                >
                  ✨
                </div>
                <div style={{ minWidth: 0 }}>
                  <div className="fw-bold text-white" style={{ fontSize: "0.95rem" }}>
                    Descobrir imóveis
                  </div>
                  <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.8rem" }}>
                    Explore imóveis compatíveis consigo
                  </div>
                </div>
              </div>
              <Link
                to="/descobrir"
                className="btn fw-bold flex-shrink-0"
                style={{
                  background: "#FFC300", color: "#1a1a1a",
                  border: "none", borderRadius: 10, padding: "0.55rem 1.1rem", fontSize: "0.875rem",
                }}
              >
                Explorar
              </Link>
            </div>
          )}

          {/* ── Conta ── */}
          <div className="rounded-4 shadow-sm p-4 mb-5" style={{ background: "#fff" }}>
            <div className="d-flex align-items-center gap-2 mb-1">
              <span style={{ fontSize: "1.1rem" }}>🔐</span>
              <h5 className="fw-bold mb-0" style={{ color: "#1a1a1a" }}>Conta</h5>
            </div>
            <p className="text-muted mb-3" style={{ fontSize: "0.85rem" }}>
              Sessão iniciada com Google.
            </p>
            <button
              onClick={() => { logout(); navigate("/"); }}
              className="btn btn-outline-danger fw-semibold px-4"
              style={{ borderRadius: 10 }}
            >
              Terminar sessão
            </button>
          </div>

        </div>{/* /maxWidth wrapper */}
      </div>{/* /container */}
    </div>
  );
}
