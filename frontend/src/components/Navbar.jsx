import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import i18n from "../i18n/index.js";
import { getUtilizador, logout } from "../services/auth";
import { useTema } from "../context/ThemeContext";
import logo from "../assets/logo.png";
import flagPT from "../assets/flags/pt.svg";
import flagGB from "../assets/flags/gb.svg";
import flagES from "../assets/flags/es.svg";
import flagFR from "../assets/flags/fr.svg";
import flagDE from "../assets/flags/de.svg";
import flagIT from "../assets/flags/it.svg";

const IDIOMAS = [
  { code: "pt", label: "Português", flag: flagPT },
  { code: "en", label: "English",   flag: flagGB },
  { code: "es", label: "Español",   flag: flagES },
  { code: "fr", label: "Français",  flag: flagFR },
  { code: "de", label: "Deutsch",   flag: flagDE },
  { code: "it", label: "Italiano",  flag: flagIT },
];

export default function Navbar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const utilizador = getUtilizador();
  const { darkMode, setDarkMode } = useTema();
  const { t } = useTranslation();
  const [idioma, setIdioma] = useState(() => localStorage.getItem("ah_idioma") || "pt");
  const idiomaAtual = IDIOMAS.find((i) => i.code === idioma) || IDIOMAS[0];
  const [propostasNaoLidas, setPropostasNaoLidas] = useState(0);

  useEffect(() => {
    if (!utilizador || utilizador.perfil !== "senhorio") return;
    const API_URL = `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api`;
    const token = localStorage.getItem("ah_token");
    fetch(`${API_URL}/candidaturas/nao-lidas`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((d) => setPropostasNaoLidas(d.total || 0))
      .catch(() => {});
  }, [utilizador?.id]);

  function handleChangeLanguage(code) {
    setIdioma(code);
    localStorage.setItem("ah_idioma", code);
    i18n.changeLanguage(code);
  }

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <nav className="navbar navbar-expand-lg navbar-dark sticky-top shadow" style={{ background: "#1a1a1a" }}>
      <div className="container">
        <Link className="navbar-brand d-flex align-items-center" to="/">
          <img
            src={logo}
            alt="ArrendaHouse"
            style={{ height: 38, borderRadius: 7, objectFit: "contain" }}
          />
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navMenu"
          aria-controls="navMenu"
          aria-expanded="false"
          aria-label="Alternar navegação"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navMenu">
          <ul className="navbar-nav me-auto gap-1">
            <li className="nav-item">
              <Link
                className={`nav-link px-3 ${pathname === "/" ? "active fw-semibold" : ""}`}
                to="/"
              >
                {t("nav.home")}
              </Link>
            </li>
            <li className="nav-item">
              <Link
                className={`nav-link px-3 ${pathname === "/imoveis" ? "active fw-semibold" : ""}`}
                to="/imoveis"
              >
                {t("nav.properties")}
              </Link>
            </li>
          </ul>

          <div className="d-flex align-items-center gap-2 mt-2 mt-lg-0">
            {/* Botão modo noturno */}
            <button
              onClick={() => setDarkMode((d) => !d)}
              className="btn btn-sm"
              title={darkMode ? t("nav.day_mode") : t("nav.night_mode")}
              style={{
                background: darkMode ? "rgba(255,195,0,0.15)" : "rgba(255,255,255,0.1)",
                border: "none",
                borderRadius: "50%",
                width: 36,
                height: 36,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.1rem",
                transition: "background 0.2s",
              }}
            >
              {darkMode ? "☀️" : "🌙"}
            </button>
            {utilizador ? (
              // Utilizador autenticado
              <div className="dropdown">
                <button
                  className="btn d-flex align-items-center gap-2 fw-semibold text-white"
                  style={{ background: "rgba(255,255,255,0.1)", borderRadius: "50px", padding: "6px 14px", border: "none", position: "relative" }}
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  {propostasNaoLidas > 0 && (
                    <span style={{ position: "absolute", top: 4, right: 4, width: 10, height: 10, background: "#e63946", borderRadius: "50%", border: "2px solid #1a1a1a" }} />
                  )}
                  {utilizador.foto_url ? (
                    <img
                      src={utilizador.foto_url}
                      alt={utilizador.nome}
                      style={{ width: 30, height: 30, borderRadius: "50%", objectFit: "cover" }}
                    />
                  ) : (
                    <div
                      style={{
                        width: 30, height: 30, borderRadius: "50%",
                        background: "#FFC300", color: "#1a1a1a",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontWeight: "bold", fontSize: "0.85rem"
                      }}
                    >
                      {utilizador.nome?.[0]?.toUpperCase() || "U"}
                    </div>
                  )}
                  <span className="d-none d-lg-inline" style={{ maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {utilizador.nome?.split(" ")[0]}
                  </span>
                  <span
                    className="badge d-none d-lg-inline"
                    style={{ background: utilizador.perfil === "senhorio" ? "#FFC300" : "rgba(255,255,255,0.2)", color: utilizador.perfil === "senhorio" ? "#1a1a1a" : "#fff", fontSize: "0.65rem" }}
                  >
                    {utilizador.perfil}
                  </span>
                </button>
                <ul className="dropdown-menu dropdown-menu-end shadow-lg border-0 p-2" style={{ minWidth: 270, borderRadius: 16 }}>
                  {/* Cabeçalho do utilizador */}
                  <li>
                    <div className="d-flex align-items-center gap-3 px-3 py-2 mb-1 rounded-3" style={{ background: "rgba(255,195,0,0.10)" }}>
                      {utilizador.foto_url ? (
                        <img src={utilizador.foto_url} alt={utilizador.nome} style={{ width: 42, height: 42, borderRadius: "50%", objectFit: "cover", border: "2px solid #FFC300" }} />
                      ) : (
                        <div style={{ width: 42, height: 42, borderRadius: "50%", background: "#FFC300", color: "#1a1a1a", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: "1.1rem", flexShrink: 0 }}>
                          {utilizador.nome?.[0]?.toUpperCase() || "U"}
                        </div>
                      )}
                      <div style={{ overflow: "hidden" }}>
                        <div className="fw-bold" style={{ fontSize: "0.92rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{utilizador.nome?.split(" ")[0]}</div>
                        <div className="text-muted" style={{ fontSize: "0.73rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{utilizador.email}</div>
                        <span className="badge mt-1" style={{ background: utilizador.perfil === "senhorio" ? "#FFC300" : "#1a1a1a", color: utilizador.perfil === "senhorio" ? "#1a1a1a" : "#fff", fontSize: "0.65rem" }}>
                          {utilizador.perfil}
                        </span>
                      </div>
                    </div>
                  </li>
                  <li><hr className="dropdown-divider my-1" /></li>

                  {/* Item helper */}
                  {[
                    { to: "/perfil", icon: "⚙️", label: t("nav.my_profile"), sub: t("nav.edit_profile"), color: "#FFC300" },
                    { to: "/favoritos", icon: "❤️", label: t("nav.favorites"), sub: t("nav.saved_properties"), color: "#ff4d6d" },
                    ...(utilizador.perfil === "inquilino" ? [
                      { to: "/curriculo", icon: "📄", label: t("nav.real_estate_cv"), sub: t("nav.my_cv"), color: "#2e7d32" },
                      { to: "/perfil/procura", icon: "🔍", label: "Preferências", sub: "Configurar pesquisa ideal", color: "#7b61ff" },
                    ] : []),
                    ...(utilizador.perfil === "senhorio" ? [
                      { to: "/meus-imoveis", icon: "🏠", label: t("nav.my_properties"), sub: t("nav.manage_listings"), color: "#2196f3" },
                      { to: "/imoveis/publicar", icon: "➕", label: t("nav.publish_property"), sub: t("nav.new_listing"), color: "#43a047" },
                      { to: "/candidaturas", icon: "📋", label: t("nav.received_applications"), sub: t("nav.tenant_cvs"), color: "#e65100", badge: propostasNaoLidas > 0 ? propostasNaoLidas : null },
                    ] : []),
                  ].map(({ to, icon, label, sub, color, badge }) => (
                    <li key={to}>
                      <Link
                        className="dropdown-item rounded-3 d-flex align-items-center gap-3 py-2 px-2"
                        to={to}
                        style={{ transition: "background 0.15s" }}
                        onMouseEnter={e => e.currentTarget.style.background = "rgba(0,0,0,0.05)"}
                        onMouseLeave={e => e.currentTarget.style.background = ""}
                      >
                        <span style={{ width: 38, height: 38, borderRadius: "50%", background: color + "1a", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.15rem", flexShrink: 0 }}>
                          {icon}
                        </span>
                        <div>
                          <div className="fw-semibold" style={{ fontSize: "0.88rem", lineHeight: 1.2 }}>
                            {label}
                            {badge && (
                              <span className="badge ms-2" style={{ background: "#e63946", color: "#fff", fontSize: "0.65rem", borderRadius: 20, padding: "2px 7px" }}>
                                🔔 {badge}
                              </span>
                            )}
                          </div>
                          <div className="text-muted" style={{ fontSize: "0.73rem" }}>{sub}</div>
                        </div>
                      </Link>
                    </li>
                  ))}

                  <li><hr className="dropdown-divider my-1" /></li>
                  <li>
                    <button
                      className="dropdown-item rounded-3 d-flex align-items-center gap-3 py-2 px-2 fw-semibold"
                      style={{ color: "#e63946", transition: "background 0.15s" }}
                      onMouseEnter={e => e.currentTarget.style.background = "rgba(230,57,70,0.08)"}
                      onMouseLeave={e => e.currentTarget.style.background = ""}
                      onClick={handleLogout}
                    >
                      <span style={{ width: 38, height: 38, borderRadius: "50%", background: "rgba(230,57,70,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.15rem", flexShrink: 0 }}>
                        🚪
                      </span>
                      <div>
                        <div style={{ fontSize: "0.88rem", lineHeight: 1.2 }}>{t("nav.logout")}</div>
                        <div style={{ fontSize: "0.73rem", color: "#aaa" }}>{t("nav.end_session")}</div>
                      </div>
                    </button>
                  </li>
                </ul>
              </div>
            ) : (
              // Não autenticado
              <>
                <Link
                  to="/login"
                  className="btn btn-outline-light btn-sm px-3 fw-semibold"
                >
                  {t("nav.login")}
                </Link>
                <Link
                  to="/login"
                  className="btn btn-sm px-3 fw-bold"
                  style={{ background: "#FFC300", color: "#1a1a1a" }}
                >
                  {t("nav.register")}
                </Link>

                {/* Seletor de idioma */}
                <div className="dropdown">
                  <button
                    className="btn btn-sm d-flex align-items-center gap-1"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                    title={t("nav.select_language")}
                    style={{
                      background: "rgba(255,255,255,0.1)",
                      border: "1px solid rgba(255,255,255,0.2)",
                      borderRadius: "20px",
                      padding: "4px 10px",
                      color: "#fff",
                    }}
                  >
                    <img
                      src={idiomaAtual.flag}
                      alt={idiomaAtual.label}
                      style={{ width: 21, height: 15, objectFit: "cover", borderRadius: 2 }}
                    />
                    <span className="d-none d-sm-inline" style={{ fontSize: "0.8rem" }}>
                      {idiomaAtual.code.toUpperCase()}
                    </span>
                    <span style={{ fontSize: "0.55rem", opacity: 0.7 }}>▾</span>
                  </button>
                  <ul
                    className="dropdown-menu dropdown-menu-end shadow-lg border-0 p-2"
                    style={{ minWidth: 165, borderRadius: 12 }}
                  >
                    {IDIOMAS.map(({ code, label, flag }) => (
                      <li key={code}>
                        <button
                          className="dropdown-item rounded-3 d-flex align-items-center gap-2 py-2"
                          onClick={() => handleChangeLanguage(code)}
                          style={{
                            background: idioma === code ? "rgba(255,195,0,0.12)" : "",
                            fontWeight: idioma === code ? "600" : "400",
                          }}
                        >
                          <img
                            src={flag}
                            alt={label}
                            style={{ width: 22, height: 15, objectFit: "cover", borderRadius: 2 }}
                          />
                          <span style={{ fontSize: "0.88rem" }}>{label}</span>
                          {idioma === code && (
                            <span className="ms-auto" style={{ color: "#FFC300", fontSize: "0.8rem" }}>✓</span>
                          )}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
