import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import ImovelCard from "../components/ImovelCard";
import Loading from "../components/Loading";
import { getImoveis, getFavoritos, adicionarFavorito, removerFavorito } from "../services/api";
import { getUtilizador } from "../services/auth";

const TIPOLOGIAS = ["T0", "T1", "T2", "T3", "T4"];
const CIDADES = ["Lisboa", "Porto", "Braga", "Coimbra", "Faro", "Cascais"];

export default function Imoveis() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const utilizador = getUtilizador();
  const { t } = useTranslation();

  const [imoveis, setImoveis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);
  const [favoritoIds, setFavoritoIds] = useState(new Set());

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

  // Carregar favoritos se autenticado
  useEffect(() => {
    if (!utilizador) return;
    getFavoritos().then((ids) => setFavoritoIds(new Set(ids))).catch(() => {});
  }, []);

  async function handleToggleFavorito(imovelId) {
    if (!utilizador) { navigate("/login"); return; }
    const estaFavorito = favoritoIds.has(imovelId);
    // Atualização otimista
    setFavoritoIds((prev) => {
      const next = new Set(prev);
      estaFavorito ? next.delete(imovelId) : next.add(imovelId);
      return next;
    });
    try {
      if (estaFavorito) {
        await removerFavorito(imovelId);
      } else {
        await adicionarFavorito(imovelId);
      }
    } catch {
      // Reverter em caso de erro
      setFavoritoIds((prev) => {
        const next = new Set(prev);
        estaFavorito ? next.add(imovelId) : next.delete(imovelId);
        return next;
      });
    }
  }

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
      <h2 className="fw-bold mb-1">{t("properties.title")}</h2>
      <p className="text-muted mb-4">
        {t("properties.found_other", { count: imoveis.length })}
      </p>

      {/* Filtros */}
      <div className="row g-3 mb-4 align-items-end">
        <div className="col-12 col-sm-6 col-md-4">
          <label className="form-label fw-semibold small text-uppercase text-muted">
            {t("properties.city_label")}
          </label>
          <select
            className="form-select"
            value={cidadeFiltro}
            onChange={(e) => setFiltro("cidade", e.target.value)}
          >
            <option value="">{t("properties.all_cities")}</option>
            {CIDADES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="col-12 col-sm-6 col-md-4">
          <label className="form-label fw-semibold small text-uppercase text-muted">
            {t("properties.typology_label")}
          </label>
          <select
            className="form-select"
            value={tipologiaFiltro}
            onChange={(e) => setFiltro("tipologia", e.target.value)}
          >
            <option value="">{t("properties.all_typologies")}</option>
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
            {t("properties.clear_filters")}
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
          <p className="text-muted fs-5">{t("properties.no_results")}</p>
          <button className="btn btn-dark mt-2" onClick={limparFiltros}>
            {t("properties.clear_filters")}
          </button>
        </div>
      )}

      {!loading && !erro && imoveis.length > 0 && (
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
      )}
    </div>
  );
}
