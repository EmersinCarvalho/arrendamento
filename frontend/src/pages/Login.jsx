import { useState } from "react";
import { Link } from "react-router-dom";
import logo from "../assets/logo.png";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function Login() {
  const [perfil, setPerfil] = useState(null); // null | 'inquilino' | 'senhorio'
  const [modo, setModo] = useState("entrar"); // 'entrar' | 'registar'

  return (
    <div className="login-page">
      <div className="container">

        {/* Escolha de perfil */}
        {!perfil && (
          <>
            <div className="text-center mb-5">
              <img src={logo} alt="ArrendaHouse" style={{ height: 80, objectFit: "contain", marginBottom: "1.2rem" }} />
              <h1 className="fw-bold mb-2" style={{ fontSize: "2.2rem" }}>
                Bem-vindo ao <span style={{ color: "#FFC300" }}>ArrendaHouse</span>
              </h1>
              <p className="text-muted">Selecione o seu perfil para continuar</p>
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
                  Entrar com Google
                </a>
                <div className="d-flex align-items-center gap-3 mt-4 mb-2" style={{ maxWidth: 420, margin: "1rem auto 0" }}>
                  <hr style={{ flex: 1, borderColor: "rgba(255,255,255,0.15)" }} />
                  <span className="text-muted small">ou continue com email</span>
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
                  <h3 className="fw-bold mb-2">Sou Inquilino</h3>
                  <p style={{ color: "rgba(255,255,255,0.7)" }} className="mb-4">
                    Quero encontrar um imóvel para arrendar perto de mim.
                  </p>
                  <div
                    className="btn w-100 fw-bold py-3"
                    style={{ background: "#FFC300", color: "#1a1a1a", borderRadius: "10px" }}
                  >
                    Continuar como Inquilino →
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
                  <h3 className="fw-bold mb-2">Sou Senhorio</h3>
                  <p style={{ color: "rgba(26,26,26,0.65)" }} className="mb-4">
                    Tenho um imóvel para arrendar e quero publicar o meu anúncio.
                  </p>
                  <div
                    className="btn w-100 fw-bold py-3"
                    style={{ background: "#1a1a1a", color: "#FFC300", borderRadius: "10px" }}
                  >
                    Continuar como Senhorio →
                  </div>
                </div>
              </div>
            </div>

            <p className="text-center text-muted mt-4 small">
              Ao entrar, concorda com os nossos Termos de Serviço e Política de Privacidade.
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
                  {perfil === "inquilino" ? "Inquilino" : "Senhorio"}
                </h2>
                <p className="text-muted small">
                  {perfil === "inquilino"
                    ? "Aceda à sua conta ou crie uma nova para encontrar o seu lar."
                    : "Aceda à sua conta ou crie uma nova para gerir os seus imóveis."}
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
                  Entrar
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
                  Registar
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
                  Entrar com Google
                </a>

                <div className="d-flex align-items-center gap-2 mb-3">
                  <hr style={{ flex: 1 }} />
                  <span className="text-muted small">ou com email</span>
                  <hr style={{ flex: 1 }} />
                </div>

                <form onSubmit={(e) => e.preventDefault()}>
                  {modo === "registar" && (
                    <div className="mb-3">
                      <label className="form-label fw-semibold small">Nome completo</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="O seu nome"
                        style={{ borderRadius: "10px", padding: "0.75rem 1rem" }}
                      />
                    </div>
                  )}

                  <div className="mb-3">
                    <label className="form-label fw-semibold small">Email</label>
                    <input
                      type="email"
                      className="form-control"
                      placeholder="email@exemplo.com"
                      style={{ borderRadius: "10px", padding: "0.75rem 1rem" }}
                    />
                  </div>

                  <div className="mb-4">
                    <label className="form-label fw-semibold small">Password</label>
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
                    {modo === "entrar" ? "Entrar na conta" : "Criar conta"}
                  </button>
                </form>

                {modo === "entrar" && (
                  <p className="text-center text-muted small mt-3 mb-0">
                    <a href="#" style={{ color: "#FFC300", textDecoration: "none" }}>
                      Esqueceu a password?
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
                  ← Escolher outro perfil
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
