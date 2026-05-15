import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Loading from "../components/Loading";
import { getImovelById } from "../services/api";

export default function DetalheImovel() {
  const { id } = useParams();
  const [imovel, setImovel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    getImovelById(id)
      .then(setImovel)
      .catch(() => setErro("Imóvel não encontrado."))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="container py-5"><Loading /></div>;
  if (erro)
    return (
      <div className="container py-5 text-center">
        <p className="text-danger fs-5">{erro}</p>
        <Link to="/imoveis" className="btn btn-dark">Voltar aos imóveis</Link>
      </div>
    );

  return (
    <div className="container py-5">
      <Link to="/imoveis" className="btn btn-outline-secondary btn-sm mb-4">
        ← Voltar
      </Link>

      <div className="row g-4">
        <div className="col-12 col-lg-7">
          <img
            src={imovel.foto}
            alt={imovel.titulo}
            className="img-fluid rounded-3 shadow w-100"
            style={{ maxHeight: "420px", objectFit: "cover" }}
          />
        </div>

        <div className="col-12 col-lg-5">
          <div className="d-flex gap-2 mb-3">
            <span className="badge bg-warning text-dark fs-6">{imovel.tipologia}</span>
            <span className="badge bg-dark fs-6">{imovel.cidade}</span>
          </div>

          <h1 className="fw-bold mb-2">{imovel.titulo}</h1>
          <p className="text-muted mb-4">{imovel.descricao}</p>

          <div className="card border-0 bg-light p-4 mb-4">
            <span className="text-muted small text-uppercase fw-semibold">Renda mensal</span>
            <span className="display-6 fw-bold text-success">
              {imovel.preco.toLocaleString("pt-PT")} €
              <small className="fs-6 text-muted fw-normal">/mês</small>
            </span>
          </div>

          <button className="btn btn-warning btn-lg w-100 fw-semibold">
            Pedir informações
          </button>
        </div>
      </div>
    </div>
  );
}
