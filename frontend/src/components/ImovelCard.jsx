import { Link } from "react-router-dom";

export default function ImovelCard({ imovel }) {
  return (
    <div className="card h-100 shadow-sm border-0 imovel-card">
      <div className="card-img-wrapper overflow-hidden" style={{ height: "210px" }}>
        <img
          src={imovel.foto}
          alt={imovel.titulo}
          className="card-img-top w-100 h-100 object-fit-cover"
        />
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
