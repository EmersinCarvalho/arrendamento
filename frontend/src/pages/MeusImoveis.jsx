import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getUtilizador } from "../services/auth";
import { getMeusImoveis, eliminarImovel } from "../services/api";

export default function MeusImoveis() {
  const navigate = useNavigate();
  const utilizador = getUtilizador();

  const [imoveis, setImoveis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);
  const [eliminando, setEliminando] = useState(null);

  useEffect(() => {
    if (!utilizador) { navigate("/login"); return; }
    if (utilizador.perfil !== "senhorio") { navigate("/"); return; }
    carregar();
  }, []);

  async function carregar() {
    setLoading(true);
    setErro(null);
    try {
      const dados = await getMeusImoveis();
      setImoveis(dados);
    } catch (err) {
      setErro(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleEliminar(imovel) {
    if (!window.confirm(`Tem a certeza que quer eliminar "${imovel.titulo}"? Esta ação não pode ser desfeita.`)) return;
    setEliminando(imovel.id);
    try {
      await eliminarImovel(imovel.id);
      setImoveis((prev) => prev.filter((i) => i.id !== imovel.id));
    } catch (err) {
      alert(err.message || "Erro ao eliminar imóvel.");
    } finally {
      setEliminando(null);
    }
  }

  if (!utilizador || utilizador.perfil !== "senhorio") return null;

  return (
    <div style={{ minHeight: "100vh", background: "#f8f9fa" }}>
      {/* Header */}
      <div
        style={{
          background: "linear-gradient(135deg, #1a1a1a 0%, #2c2c2c 100%)",
          padding: "3rem 0 2.5rem",
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
          <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
            <div>
              <div
                className="badge fw-semibold mb-3"
                style={{
                  background: "rgba(255,195,0,0.15)", color: "#FFC300",
                  fontSize: "0.7rem", letterSpacing: "1px", textTransform: "uppercase", padding: "6px 14px",
                }}
              >
                🔑 Área Senhorio
              </div>
              <h1 className="text-white fw-bold mb-2" style={{ fontSize: "2rem" }}>
                Os meus imóveis
              </h1>
              <p className="text-white-50 mb-0">
                Gira os seus anúncios publicados na plataforma.
              </p>
            </div>
            <Link
              to="/imoveis/publicar"
              className="btn fw-bold"
              style={{
                background: "#FFC300", color: "#1a1a1a",
                borderRadius: 12, padding: "0.75rem 1.5rem",
                border: "none", fontSize: "0.95rem", textDecoration: "none",
              }}
            >
              + Publicar novo imóvel
            </Link>
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="container py-5">
        {loading && (
          <div className="d-flex justify-content-center py-5">
            <div className="spinner-border" style={{ color: "#FFC300" }} />
          </div>
        )}

        {erro && !loading && (
          <div
            className="alert"
            style={{ background: "#f8d7da", border: "1px solid #f5c6cb", color: "#721c24", borderRadius: 12 }}
          >
            ⚠️ {erro}
          </div>
        )}

        {!loading && !erro && imoveis.length === 0 && (
          <div className="text-center py-5">
            <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>🏠</div>
            <h4 className="fw-bold text-dark mb-2">Ainda não tem imóveis publicados</h4>
            <p className="text-muted mb-4">Publique o seu primeiro anúncio e comece a receber contactos.</p>
            <Link
              to="/imoveis/publicar"
              className="btn fw-bold"
              style={{
                background: "#FFC300", color: "#1a1a1a",
                borderRadius: 12, padding: "0.75rem 2rem", border: "none",
              }}
            >
              + Publicar primeiro imóvel
            </Link>
          </div>
        )}

        {!loading && !erro && imoveis.length > 0 && (
          <>
            <p className="text-muted mb-4">
              {imoveis.length} imóvel{imoveis.length !== 1 ? "eis" : ""} publicado{imoveis.length !== 1 ? "s" : ""}
            </p>
            <div className="row g-4">
              {imoveis.map((imovel) => (
                <div key={imovel.id} className="col-lg-6">
                  <div
                    style={{
                      background: "#fff",
                      borderRadius: 16,
                      overflow: "hidden",
                      boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
                      border: imovel.disponivel ? "none" : "2px dashed #ccc",
                    }}
                  >
                    {/* Foto */}
                    <div style={{ position: "relative", height: 180, background: "#e9ecef" }}>
                      {imovel.foto ? (
                        <img
                          src={imovel.foto}
                          alt={imovel.titulo}
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          onError={(e) => { e.target.style.display = "none"; }}
                        />
                      ) : (
                        <div
                          className="d-flex align-items-center justify-content-center h-100"
                          style={{ color: "#aaa", fontSize: "3rem" }}
                        >
                          🏠
                        </div>
                      )}
                      {/* Badge disponível */}
                      <div
                        style={{
                          position: "absolute", top: 12, left: 12,
                          background: imovel.disponivel ? "#28a745" : "#6c757d",
                          color: "#fff", borderRadius: 20, padding: "4px 12px",
                          fontSize: "0.75rem", fontWeight: 600,
                        }}
                      >
                        {imovel.disponivel ? "● Disponível" : "● Indisponível"}
                      </div>
                    </div>

                    {/* Info */}
                    <div className="p-4">
                      <div className="d-flex gap-2 mb-2 flex-wrap">
                        {imovel.tipologia && (
                          <span
                            className="badge"
                            style={{ background: "rgba(255,195,0,0.15)", color: "#b8860b", fontWeight: 600, fontSize: "0.75rem" }}
                          >
                            {imovel.tipologia}
                          </span>
                        )}
                        {imovel.tipo_imovel && (
                          <span
                            className="badge"
                            style={{ background: "#f0f0f0", color: "#555", fontWeight: 500, fontSize: "0.75rem" }}
                          >
                            {imovel.tipo_imovel}
                          </span>
                        )}
                        {imovel.cidade && (
                          <span
                            className="badge"
                            style={{ background: "#f0f0f0", color: "#555", fontWeight: 500, fontSize: "0.75rem" }}
                          >
                            📍 {imovel.cidade}
                          </span>
                        )}
                      </div>

                      <h6 className="fw-bold mb-1" style={{ color: "#1a1a1a", fontSize: "1rem" }}>
                        {imovel.titulo}
                      </h6>
                      <p className="text-muted mb-3" style={{ fontSize: "0.85rem" }}>
                        {imovel.descricao
                          ? imovel.descricao.length > 80
                            ? imovel.descricao.slice(0, 80) + "..."
                            : imovel.descricao
                          : "Sem descrição"}
                      </p>

                      <div className="d-flex align-items-center justify-content-between">
                        <span className="fw-bold" style={{ color: "#FFC300", fontSize: "1.2rem" }}>
                          {Number(imovel.preco).toLocaleString("pt-PT")} €/mês
                        </span>
                        <div className="d-flex gap-2">
                          {/* Extras pequenos */}
                          <div className="d-flex gap-1">
                            {imovel.aceita_pets ? <span title="Aceita pets" style={{ fontSize: "1rem" }}>🐾</span> : null}
                            {imovel.mobiliado ? <span title="Mobilado" style={{ fontSize: "1rem" }}>🛋️</span> : null}
                            {imovel.despesas_incluidas ? <span title="Despesas incluídas" style={{ fontSize: "1rem" }}>💡</span> : null}
                          </div>
                        </div>
                      </div>

                      {/* Ações */}
                      <div className="d-flex gap-2 mt-3">
                        <Link
                          to={`/imoveis/${imovel.id}`}
                          className="btn btn-sm flex-grow-1"
                          style={{
                            border: "1.5px solid #e0e0e0", borderRadius: 8, background: "#fff",
                            color: "#555", fontSize: "0.85rem",
                          }}
                        >
                          👁️ Ver
                        </Link>
                        <Link
                          to={`/editar-imovel/${imovel.id}`}
                          className="btn btn-sm flex-grow-1"
                          style={{
                            border: "1.5px solid #FFC300", borderRadius: 8, background: "rgba(255,195,0,0.08)",
                            color: "#b8860b", fontSize: "0.85rem", fontWeight: 600,
                          }}
                        >
                          ✏️ Editar
                        </Link>
                        <button
                          className="btn btn-sm flex-grow-1"
                          style={{
                            border: "1.5px solid #dc3545", borderRadius: 8, background: "rgba(220,53,69,0.06)",
                            color: "#dc3545", fontSize: "0.85rem", fontWeight: 600,
                          }}
                          disabled={eliminando === imovel.id}
                          onClick={() => handleEliminar(imovel)}
                        >
                          {eliminando === imovel.id ? "..." : "🗑️ Eliminar"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
