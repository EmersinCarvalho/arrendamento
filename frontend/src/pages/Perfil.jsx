import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getUtilizador, setToken, getToken, logout } from "../services/auth";
import { atualizarContactos } from "../services/api";
import logo from "../assets/logo.png";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function Perfil() {
  const navigate = useNavigate();
  const utilizador = getUtilizador();
  const { t, i18n } = useTranslation();

  const [perfilEscolhido, setPerfilEscolhido] = useState(utilizador?.perfil || "inquilino");
  const [membroDesde, setMembroDesde] = useState(null);
  const [saving, setSaving] = useState(false);
  const [sucesso, setSucesso] = useState(false);

  const [telefone, setTelefone] = useState("");
  const [bio, setBio] = useState("");
  const [savingContacto, setSavingContacto] = useState(false);
  const [sucessoContacto, setSucessoContacto] = useState(false);

  useEffect(() => {
    if (!utilizador) { navigate("/login"); return; }
    // Buscar data de criação
    fetch(`${API}/api/auth/me`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.criado_em) setMembroDesde(new Date(d.criado_em));
        if (d.telefone) setTelefone(d.telefone);
        if (d.bio) setBio(d.bio);
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
      alert(t("perfil.save_error"));
    } finally {
      setSaving(false);
    }
  }

  async function guardarContacto() {
    setSavingContacto(true);
    setSucessoContacto(false);
    try {
      await atualizarContactos({ telefone, bio });
      setSucessoContacto(true);
      setTimeout(() => setSucessoContacto(false), 3000);
    } catch {
      alert(t("perfil.save_error"));
    } finally {
      setSavingContacto(false);
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
                  {t("perfil.member_since")}{" "}
                  {membroDesde.toLocaleDateString(i18n.language, { month: "long", year: "numeric" })}
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
              <h5 className="fw-bold mb-0" style={{ color: "#1a1a1a" }}>{t("perfil.account_type")}</h5>
            </div>
            <p className="text-muted mb-3" style={{ fontSize: "0.85rem" }}>
              {t("perfil.account_type_desc")}
            </p>

            <div className="row g-3 mb-3">
              {[
                { valor: "inquilino", icon: "🏠", label: t("perfil.tenant_label"), sub: t("perfil.tenant_sub") },
                { valor: "senhorio", icon: "🔑", label: t("perfil.landlord_label"), sub: t("perfil.landlord_sub") },
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
                  ? <><span className="spinner-border spinner-border-sm me-2" />{t("perfil.saving")}</>
                  : t("perfil.save_change")}
              </button>
            )}
            {sucesso && (
              <div className="alert alert-success py-2 px-3 mt-2 mb-0 rounded-3" style={{ fontSize: "0.85rem" }}>
                {t("perfil.profile_updated")}
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
                    {t("perfil.search_prefs")}
                  </div>
                  <div className="text-muted text-truncate" style={{ fontSize: "0.8rem" }}>
                    {t("perfil.search_prefs_desc")}
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
                {t("perfil.edit")}
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
                    {t("perfil.discover")}
                  </div>
                  <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.8rem" }}>
                    {t("perfil.discover_desc")}
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
                {t("perfil.explore")}
              </Link>
            </div>
          )}

          {/* ── Informações de contacto ── */}
          <div className="rounded-4 shadow-sm p-4 mb-3" style={{ background: "#fff" }}>
            <div className="d-flex align-items-center gap-2 mb-1">
              <span style={{ fontSize: "1.1rem" }}>📞</span>
              <h5 className="fw-bold mb-0" style={{ color: "#1a1a1a" }}>{t("perfil.contact_info")}</h5>
            </div>
            <p className="text-muted mb-3" style={{ fontSize: "0.85rem" }}>
              {t("perfil.contact_info_desc")}
            </p>
            <div className="mb-3">
              <label className="form-label fw-semibold" style={{ fontSize: "0.85rem" }}>{t("perfil.phone")}</label>
              <input
                type="tel"
                className="form-control"
                placeholder="+351 912 345 678"
                value={telefone}
                onChange={(e) => setTelefone(e.target.value.replace(/[^0-9+\s\-()]/g, ""))}
                style={{ borderRadius: 10 }}
              />
            </div>
            <div className="mb-3">
              <label className="form-label fw-semibold" style={{ fontSize: "0.85rem" }}>{t("perfil.about_me")}</label>
              <textarea
                className="form-control"
                rows={3}
                placeholder={t("perfil.about_placeholder")}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                maxLength={1000}
                style={{ borderRadius: 10, resize: "none" }}
              />
              <div className="text-end text-muted" style={{ fontSize: "0.75rem" }}>{bio.length}/1000</div>
            </div>
            <button
              onClick={guardarContacto}
              disabled={savingContacto}
              className="btn fw-bold px-4 py-2 rounded-3"
              style={{ background: "#FFC300", color: "#1a1a1a", border: "none" }}
            >
              {savingContacto
                ? <><span className="spinner-border spinner-border-sm me-2" />{t("perfil.saving")}</>
                : t("perfil.save_contacts")}
            </button>
            {sucessoContacto && (
              <div className="alert alert-success py-2 px-3 mt-2 mb-0 rounded-3" style={{ fontSize: "0.85rem" }}>
                                {t("perfil.contacts_updated")}
              </div>
            )}
          </div>

          {/* ── Conta ── */}
          <div className="rounded-4 shadow-sm p-4 mb-5" style={{ background: "#fff" }}>
            <div className="d-flex align-items-center gap-2 mb-1">
              <span style={{ fontSize: "1.1rem" }}>🔐</span>
              <h5 className="fw-bold mb-0" style={{ color: "#1a1a1a" }}>{t("perfil.account")}</h5>
            </div>
            <p className="text-muted mb-3" style={{ fontSize: "0.85rem" }}>
              {t("perfil.google_session")}
            </p>
            <button
              onClick={() => { logout(); navigate("/"); }}
              className="btn btn-outline-danger fw-semibold px-4"
              style={{ borderRadius: 10 }}
            >
              {t("nav.end_session")}
            </button>
          </div>

        </div>{/* /maxWidth wrapper */}
      </div>{/* /container */}
    </div>
  );
}
