import { Link } from "react-router-dom";

export default function ImovelCard({ imovel, favorito = false, onToggleFavorito }) {
  return (
    <div className="card h-100 shadow-sm border-0 imovel-card">
      <div className="card-img-wrapper overflow-hidden" style={{ height: "210px", position: "relative" }}>
        <img
          src={imovel.foto}
          alt={imovel.titulo}
          className="card-img-top w-100 h-100 object-fit-cover"
        />
        {/* Botão favorito */}
        <button
          onClick={(e) => { e.preventDefault(); onToggleFavorito && onToggleFavorito(imovel.id); }}
          title={favorito ? "Remover dos favoritos" : "Adicionar aos favoritos"}
          style={{
            position: "absolute", top: 10, right: 10,
            background: "rgba(255,255,255,0.92)",
            border: "none", borderRadius: "50%",
            width: 38, height: 38,
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer",
            boxShadow: "0 2px 8px rgba(0,0,0,0.18)",
            fontSize: "1.2rem",
            transition: "transform 0.15s",
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.15)"}
          onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
        >
          {favorito ? "❤️" : "🤍"}
        </button>
      </div>

      <div className="card-body d-flex flex-column">
        <div className="d-flex justify-content-between align-items-start mb-2">
          <span className="badge badge-tipologia fw-semibold">
            {imovel.tipologia}
          </span>
          <span className="badge badge-cidade">{imovel.cidade}</span>
        </div>

        <h5 className="card-title fw-bold mb-1">{imovel.titulo}</h5>
        <p className="card-text text-muted small flex-grow-1">{imovel.descricao}</p>

        <div className="d-flex justify-content-between align-items-center mt-3">
          <span className="fs-5 fw-bold text-success">
            {imovel.preco.toLocaleString("pt-PT")} €
            <small className="text-muted fw-normal fs-6">/mês</small>
          </span>
          <Link
            to={`/imoveis/${imovel.id}`}
            className="btn btn-sm px-3 fw-bold"
            style={{ background: "#1a1a1a", color: "#FFC300", borderRadius: "8px" }}
          >
            Ver imóvel
          </Link>
        </div>
      </div>
    </div>
  );
}
