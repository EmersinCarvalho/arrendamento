import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import ImovelCard from "../components/ImovelCard";
import Loading from "../components/Loading";
import { getImoveis } from "../services/api";

const TIPOLOGIAS = ["T0", "T1", "T2", "T3", "T4"];
const CIDADES = ["Lisboa", "Porto", "Braga", "Coimbra", "Faro", "Cascais"];

export default function Imoveis() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [imoveis, setImoveis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);

  const cidadeFiltro = searchParams.get("cidade") || "";
  const tipologiaFiltro = searchParams.get("tipologia") || "";

  useEffect(() => {
    setLoading(true);
    setErro(null);
    getImoveis({ cidade: cidadeFiltro, tipologia: tipologiaFiltro })
      .then(setImoveis)
      .catch(() => setErro("Não foi possível carregar os imóveis."))
      .finally(() => setLoading(false));
  }, [cidadeFiltro, tipologiaFiltro]);

  function setFiltro(key, value) {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    setSearchParams(params);
  }

  function limparFiltros() {
    setSearchParams({});
  }

  return (
    <div className="container py-5">
      <h2 className="fw-bold mb-1">Imóveis disponíveis</h2>
      <p className="text-muted mb-4">
        {imoveis.length} imóvel(is) encontrado(s)
      </p>

      {/* Filtros */}
      <div className="row g-3 mb-4 align-items-end">
        <div className="col-12 col-sm-6 col-md-4">
          <label className="form-label fw-semibold small text-uppercase text-muted">
            Cidade
          </label>
          <select
            className="form-select"
            value={cidadeFiltro}
            onChange={(e) => setFiltro("cidade", e.target.value)}
          >
            <option value="">Todas as cidades</option>
            {CIDADES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="col-12 col-sm-6 col-md-4">
          <label className="form-label fw-semibold small text-uppercase text-muted">
            Tipologia
          </label>
          <select
            className="form-select"
            value={tipologiaFiltro}
            onChange={(e) => setFiltro("tipologia", e.target.value)}
          >
            <option value="">Todas as tipologias</option>
            {TIPOLOGIAS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <div className="col-12 col-md-4">
          <button
            className="btn btn-outline-secondary w-100"
            onClick={limparFiltros}
          >
            Limpar filtros
          </button>
        </div>
      </div>

      {/* Resultados */}
      {loading && <Loading />}
      {erro && (
        <div className="alert alert-danger" role="alert">
          {erro}
        </div>
      )}

      {!loading && !erro && imoveis.length === 0 && (
        <div className="text-center py-5">
          <p className="text-muted fs-5">Nenhum imóvel encontrado com os filtros aplicados.</p>
          <button className="btn btn-dark mt-2" onClick={limparFiltros}>
            Limpar filtros
          </button>
        </div>
      )}

      {!loading && !erro && imoveis.length > 0 && (
        <div className="row g-4">
          {imoveis.map((imovel) => (
            <div key={imovel.id} className="col-12 col-md-6 col-lg-4">
              <ImovelCard imovel={imovel} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
