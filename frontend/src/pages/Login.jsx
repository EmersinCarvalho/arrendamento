import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import logo from "../assets/logo.png";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function Login() {
  const { t } = useTranslation();
  const [perfil, setPerfil] = useState(null);
  const [modo, setModo] = useState("entrar");

  return (
    <div className="login-page">
      <div className="container">

        {/* Escolha de perfil */}
        {!perfil && (
          <>
            <div className="text-center mb-5">
              <img src={logo} alt="ArrendaHouse" style={{ height: 80, objectFit: "contain", marginBottom: "1.2rem" }} />
              <h1 className="fw-bold mb-2" style={{ fontSize: "2.2rem" }}>
                {t("login.welcome")} <span style={{ color: "#FFC300" }}>ArrendaHouse</span>
              </h1>
              <p className="text-muted">{t("login.select_profile")}</p>
            </div>

            <div className="row g-4 justify-content-center">
              {/* Google OAuth — entrada rápida */}
              <div className="col-12 col-md-10 text-center">
                <a
                  href={`${API}/api/auth/google`}
                  className="btn btn-light w-100 fw-semibold py-3 rounded-3 d-flex align-items-center justify-content-center gap-2"
                  style={{ fontSize: "1rem", maxWidth: 420, margin: "0 auto" }}
                >
                  <img
                    src="https://developers.google.com/identity/images/g-logo.png"
                    alt="Google"
                    style={{ width: 22, height: 22 }}
                  />
                  {t("login.google_login")}
                </a>
                <div className="d-flex align-items-center gap-3 mt-4 mb-2" style={{ maxWidth: 420, margin: "1rem auto 0" }}>
                  <hr style={{ flex: 1, borderColor: "rgba(255,255,255,0.15)" }} />
                  <span className="text-muted small">{t("login.or_email")}</span>
                  <hr style={{ flex: 1, borderColor: "rgba(255,255,255,0.15)" }} />
                </div>
              </div>
            </div>

            <div className="row g-4 justify-content-center mt-1">
              {/* Inquilino */}
              <div className="col-12 col-md-5">
                <div
                  className="login-option-card inquilino-card shadow p-5 text-center"
                  onClick={() => setPerfil("inquilino")}
                >
                  <div className="option-icon">🏠</div>
                  <h3 className="fw-bold mb-2">{t("login.tenant_title")}</h3>
                  <p style={{ color: "rgba(255,255,255,0.7)" }} className="mb-4">
                    {t("login.tenant_desc")}
                  </p>
                  <div
                    className="btn w-100 fw-bold py-3"
                    style={{ background: "#FFC300", color: "#1a1a1a", borderRadius: "10px" }}
                  >
                    {t("login.tenant_btn")}
                  </div>
                </div>
              </div>

              {/* Senhorio */}
              <div className="col-12 col-md-5">
                <div
                  className="login-option-card senhorio-card shadow p-5 text-center"
                  onClick={() => setPerfil("senhorio")}
                >
                  <div className="option-icon">🔑</div>
                  <h3 className="fw-bold mb-2">{t("login.landlord_title")}</h3>
                  <p style={{ color: "rgba(26,26,26,0.65)" }} className="mb-4">
                    {t("login.landlord_desc")}
                  </p>
                  <div
                    className="btn w-100 fw-bold py-3"
                    style={{ background: "#1a1a1a", color: "#FFC300", borderRadius: "10px" }}
                  >
                    {t("login.landlord_btn")}
                  </div>
                </div>
              </div>
            </div>

            <p className="text-center text-muted mt-4 small">
              {t("login.terms")}
            </p>
          </>
        )}

        {/* Formulário após selecionar perfil */}
        {perfil && (
          <div className="row justify-content-center">
            <div className="col-12 col-md-5">
              {/* Header */}
              <div className="text-center mb-4">
                <div style={{ fontSize: "3rem", marginBottom: "0.5rem" }}>
                  {perfil === "inquilino" ? "🏠" : "🔑"}
                </div>
                <h2 className="fw-bold mb-1" style={{ fontSize: "1.8rem" }}>
                  {perfil === "inquilino" ? t("login.tenant_title") : t("login.landlord_title")}
                </h2>
                <p className="text-muted small">
                  {perfil === "inquilino"
                    ? t("login.tenant_form_subtitle")
                    : t("login.landlord_form_subtitle")}
                </p>
              </div>

              {/* Tabs Entrar / Registar */}
              <div
                className="d-flex rounded-3 mb-4 p-1"
                style={{ background: "#f0f0f0" }}
              >
                <button
                  className="btn w-50 fw-semibold py-2"
                  style={{
                    background: modo === "entrar" ? "#1a1a1a" : "transparent",
                    color: modo === "entrar" ? "#FFC300" : "#666",
                    borderRadius: "8px",
                    transition: "0.2s",
                    border: "none",
                  }}
                  onClick={() => setModo("entrar")}
                >
                  {t("login.tab_login")}
                </button>
                <button
                  className="btn w-50 fw-semibold py-2"
                  style={{
                    background: modo === "registar" ? "#1a1a1a" : "transparent",
                    color: modo === "registar" ? "#FFC300" : "#666",
                    borderRadius: "8px",
                    transition: "0.2s",
                    border: "none",
                  }}
                  onClick={() => setModo("registar")}
                >
                  {t("login.tab_register")}
                </button>
              </div>

              {/* Formulário */}
              <div
                className="p-4 rounded-4 shadow-sm"
                style={{ background: "#fff", border: "1px solid #eee" }}
              >
                {/* Google OAuth no form */}
                <a
                  href={`${API}/api/auth/google`}
                  className="btn btn-outline-secondary w-100 fw-semibold py-2 mb-3 d-flex align-items-center justify-content-center gap-2"
                  style={{ borderRadius: "10px" }}
                >
                  <img
                    src="https://developers.google.com/identity/images/g-logo.png"
                    alt="Google"
                    style={{ width: 20, height: 20 }}
                  />
                  {t("login.google_login")}
                </a>

                <div className="d-flex align-items-center gap-2 mb-3">
                  <hr style={{ flex: 1 }} />
                  <span className="text-muted small">{t("login.or_email_short")}</span>
                  <hr style={{ flex: 1 }} />
                </div>

                <form onSubmit={(e) => e.preventDefault()}>
                  {modo === "registar" && (
                    <div className="mb-3">
                      <label className="form-label fw-semibold small">{t("login.full_name")}</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder={t("login.name_placeholder")}
                        style={{ borderRadius: "10px", padding: "0.75rem 1rem" }}
                      />
                    </div>
                  )}

                  <div className="mb-3">
                    <label className="form-label fw-semibold small">{t("login.email_label")}</label>
                    <input
                      type="email"
                      className="form-control"
                      placeholder="email@exemplo.com"
                      style={{ borderRadius: "10px", padding: "0.75rem 1rem" }}
                    />
                  </div>

                  <div className="mb-4">
                    <label className="form-label fw-semibold small">{t("login.password_label")}</label>
                    <input
                      type="password"
                      className="form-control"
                      placeholder="••••••••"
                      style={{ borderRadius: "10px", padding: "0.75rem 1rem" }}
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn w-100 fw-bold py-3"
                    style={{
                      background: "#FFC300",
                      color: "#1a1a1a",
                      borderRadius: "10px",
                      fontSize: "1rem",
                    }}
                  >
                    {modo === "entrar" ? t("login.login_btn") : t("login.register_btn")}
                  </button>
                </form>

                {modo === "entrar" && (
                  <p className="text-center text-muted small mt-3 mb-0">
                    <a href="#" style={{ color: "#FFC300", textDecoration: "none" }}>
                      {t("login.forgot_password")}
                    </a>
                  </p>
                )}
              </div>

              {/* Voltar */}
              <div className="text-center mt-4">
                <button
                  className="btn btn-link text-muted small text-decoration-none"
                  onClick={() => setPerfil(null)}
                >
                  {t("login.back_profile")}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
