import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getUtilizador } from "../services/auth";
import { getFavoritosImoveis, removerFavorito } from "../services/api";
import ImovelCard from "../components/ImovelCard";
import Loading from "../components/Loading";

export default function Favoritos() {
  const navigate = useNavigate();
  const utilizador = getUtilizador();

  const [imoveis, setImoveis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);
  const [favoritoIds, setFavoritoIds] = useState(new Set());

  useEffect(() => {
    if (!utilizador) { navigate("/login"); return; }
    getFavoritosImoveis()
      .then((dados) => {
        setImoveis(dados);
        setFavoritoIds(new Set(dados.map((i) => i.id)));
      })
      .catch(() => setErro("Não foi possível carregar os seus favoritos."))
      .finally(() => setLoading(false));
  }, []);

  async function handleToggleFavorito(imovelId) {
    // Na página de favoritos só é possível remover
    setFavoritoIds((prev) => { const n = new Set(prev); n.delete(imovelId); return n; });
    setImoveis((prev) => prev.filter((i) => i.id !== imovelId));
    try {
      await removerFavorito(imovelId);
    } catch {
      // Em caso de erro recarregar
      getFavoritosImoveis().then((dados) => {
        setImoveis(dados);
        setFavoritoIds(new Set(dados.map((i) => i.id)));
      });
    }
  }

  if (!utilizador) return null;

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
          <div
            className="badge fw-semibold mb-3"
            style={{
              background: "rgba(255,195,0,0.15)", color: "#FFC300",
              fontSize: "0.7rem", letterSpacing: "1px", textTransform: "uppercase", padding: "6px 14px",
            }}
          >
            ❤️ Os meus favoritos
          </div>
          <h1 className="text-white fw-bold mb-2" style={{ fontSize: "2rem" }}>
            Imóveis guardados
          </h1>
          <p className="text-white-50 mb-0">
            Os imóveis que marcou como favoritos aparecem aqui.
          </p>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="container py-5">
        {loading && <Loading />}

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
            <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>🤍</div>
            <h4 className="fw-bold text-dark mb-2">Ainda não tem favoritos</h4>
            <p className="text-muted mb-4">
              Explore os imóveis disponíveis e guarde os que mais gostar.
            </p>
            <button
              className="btn fw-bold"
              style={{ background: "#FFC300", color: "#1a1a1a", borderRadius: 12, padding: "0.75rem 2rem", border: "none" }}
              onClick={() => navigate("/imoveis")}
            >
              Ver imóveis
            </button>
          </div>
        )}

        {!loading && !erro && imoveis.length > 0 && (
          <>
            <p className="text-muted mb-4">
              {imoveis.length} imóvel{imoveis.length !== 1 ? "eis" : ""} guardado{imoveis.length !== 1 ? "s" : ""}
            </p>
            <div className="row g-4">
              {imoveis.map((imovel) => (
                <div key={imovel.id} className="col-12 col-md-6 col-lg-4">
                  <ImovelCard
                    imovel={imovel}
                    favorito={favoritoIds.has(imovel.id)}
                    onToggleFavorito={handleToggleFavorito}
                  />
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
