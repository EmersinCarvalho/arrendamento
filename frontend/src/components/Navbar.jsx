import { Link, useLocation, useNavigate } from "react-router-dom";
import { getUtilizador, logout } from "../services/auth";

export default function Navbar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const utilizador = getUtilizador();

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <nav className="navbar navbar-expand-lg navbar-dark sticky-top shadow" style={{ background: "#1a1a1a" }}>
      <div className="container">
        <Link className="navbar-brand fw-bold fs-4 navbar-brand-logo" to="/">
          <span className="brand-arren">Arrenda</span><span className="brand-house">House</span>
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
                <ul className="dropdown-menu dropdown-menu-end shadow">
                  <li>
                    <span className="dropdown-item-text text-muted small">
                      {utilizador.email}
                    </span>
                  </li>
                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    <button className="dropdown-item text-danger fw-semibold" onClick={handleLogout}>
                      Sair
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
