import { Link, useLocation, useNavigate } from "react-router-dom";
import { getUtilizador, logout } from "../services/auth";
import { useTema } from "../context/ThemeContext";
import logo from "../assets/logo.png";

export default function Navbar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const utilizador = getUtilizador();
  const { darkMode, setDarkMode } = useTema();

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
                Início
              </Link>
            </li>
            <li className="nav-item">
              <Link
                className={`nav-link px-3 ${pathname === "/imoveis" ? "active fw-semibold" : ""}`}
                to="/imoveis"
              >
                Imóveis
              </Link>
            </li>
          </ul>

          <div className="d-flex align-items-center gap-2 mt-2 mt-lg-0">
            {/* Botão modo noturno */}
            <button
              onClick={() => setDarkMode((d) => !d)}
              className="btn btn-sm"
              title={darkMode ? "Mudar para modo claro" : "Mudar para modo noturno"}
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
                  style={{ background: "rgba(255,255,255,0.1)", borderRadius: "50px", padding: "6px 14px", border: "none" }}
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
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
                    { to: "/perfil", icon: "⚙️", label: "O meu perfil", sub: "Editar dados pessoais", color: "#FFC300" },
                    { to: "/favoritos", icon: "❤️", label: "Favoritos", sub: "Imóveis guardados", color: "#ff4d6d" },
                    ...(utilizador.perfil === "inquilino" ? [
                      { to: "/setup-procura", icon: "🔍", label: "Preferências de procura", sub: "O que procuro", color: "#4361ee" },
                      { to: "/descobrir", icon: "✨", label: "Descobrir imóveis", sub: "Sugestões para si", color: "#7209b7" },
                    ] : []),
                    ...(utilizador.perfil === "senhorio" ? [
                      { to: "/meus-imoveis", icon: "🏠", label: "Os meus imóveis", sub: "Gerir anúncios", color: "#2196f3" },
                      { to: "/imoveis/publicar", icon: "➕", label: "Publicar imóvel", sub: "Novo anúncio", color: "#43a047" },
                    ] : []),
                  ].map(({ to, icon, label, sub, color }) => (
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
                          <div className="fw-semibold" style={{ fontSize: "0.88rem", lineHeight: 1.2 }}>{label}</div>
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
                        <div style={{ fontSize: "0.88rem", lineHeight: 1.2 }}>Sair</div>
                        <div style={{ fontSize: "0.73rem", color: "#aaa" }}>Terminar sessão</div>
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
                  Entrar
                </Link>
                <Link
                  to="/login"
                  className="btn btn-sm px-3 fw-bold"
                  style={{ background: "#FFC300", color: "#1a1a1a" }}
                >
                  Registar
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
