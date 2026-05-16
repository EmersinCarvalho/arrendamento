import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { setToken, getToken } from "../services/auth";
import logo from "../assets/logo.png";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function PerfilSetup() {
  const [perfilEscolhido, setPerfilEscolhido] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function confirmar() {
    if (!perfilEscolhido) return;
    setLoading(true);

    try {
      const res = await fetch(`${API}/api/auth/perfil`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ perfil: perfilEscolhido }),
      });

      if (!res.ok) throw new Error("Erro ao guardar perfil");

      const data = await res.json();
      setToken(data.token);
      navigate("/");
    } catch {
      alert("Não foi possível guardar o perfil. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{ minHeight: "100vh", background: "#1a1a1a" }}
      className="d-flex align-items-center justify-content-center py-5"
    >
      <div style={{ maxWidth: 600, width: "100%", padding: "0 1rem" }}>
        <div className="text-center mb-5">
          <img src={logo} alt="ArrendaHouse" style={{ height: 72, objectFit: "contain", marginBottom: "1rem", borderRadius: 8 }} />
          <h2 className="fw-bold text-white mb-2">
            Bem-vindo à{" "}
            <span style={{ color: "#FFC300" }}>ArrendaHouse</span>!
          </h2>
          <p className="text-white-50">
            Como pretende usar a plataforma? Pode alterar isto mais tarde.
          </p>
        </div>

        <div className="row g-4 mb-4">
          {/* Inquilino */}
          <div className="col-md-6">
            <div
              className="rounded-4 p-4 text-center h-100"
              style={{
                background: perfilEscolhido === "inquilino" ? "#FFC300" : "#2a2a2a",
                border: `2px solid ${perfilEscolhido === "inquilino" ? "#FFC300" : "transparent"}`,
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              onClick={() => setPerfilEscolhido("inquilino")}
            >
              <div style={{ fontSize: "3rem" }} className="mb-3">🏠</div>
              <h4
                className="fw-bold mb-2"
                style={{ color: perfilEscolhido === "inquilino" ? "#1a1a1a" : "#fff" }}
              >
                Sou Inquilino
              </h4>
              <p
                className="mb-0 small"
                style={{ color: perfilEscolhido === "inquilino" ? "#333" : "#aaa" }}
              >
                Quero encontrar casa para arrendar
              </p>
            </div>
          </div>

          {/* Senhorio */}
          <div className="col-md-6">
            <div
              className="rounded-4 p-4 text-center h-100"
              style={{
                background: perfilEscolhido === "senhorio" ? "#FFC300" : "#2a2a2a",
                border: `2px solid ${perfilEscolhido === "senhorio" ? "#FFC300" : "transparent"}`,
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              onClick={() => setPerfilEscolhido("senhorio")}
            >
              <div style={{ fontSize: "3rem" }} className="mb-3">🔑</div>
              <h4
                className="fw-bold mb-2"
                style={{ color: perfilEscolhido === "senhorio" ? "#1a1a1a" : "#fff" }}
              >
                Sou Senhorio
              </h4>
              <p
                className="mb-0 small"
                style={{ color: perfilEscolhido === "senhorio" ? "#333" : "#aaa" }}
              >
                Quero anunciar imóveis para arrendar
              </p>
            </div>
          </div>
        </div>

        <button
          className="btn w-100 fw-bold py-3 rounded-3"
          style={{
            background: perfilEscolhido ? "#FFC300" : "#444",
            color: "#1a1a1a",
            cursor: perfilEscolhido ? "pointer" : "not-allowed",
            opacity: perfilEscolhido ? 1 : 0.6,
          }}
          disabled={!perfilEscolhido || loading}
          onClick={confirmar}
        >
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" />
              A guardar...
            </>
          ) : (
            "Continuar"
          )}
        </button>
      </div>
    </div>
  );
}
