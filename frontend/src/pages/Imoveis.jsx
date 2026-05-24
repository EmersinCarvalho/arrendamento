import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useTema } from "../context/ThemeContext";
import ImovelCard from "../components/ImovelCard";
import Loading from "../components/Loading";
import { getImoveis, getFavoritos, adicionarFavorito, removerFavorito } from "../services/api";
import { getUtilizador } from "../services/auth";
import { getPerfilProcura } from "../services/procura";

const TIPOLOGIAS = ["T0", "T1", "T2", "T3", "T4"];

const CIDADES = ["Lisboa", "Porto", "Braga", "Coimbra", "Faro", "Cascais"];
const POR_PAGINA = 9;

export default function Imoveis() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const utilizador = getUtilizador();
  const { t } = useTranslation();
  const { tema } = useTema();
  const escuro = tema === "escuro";

  const [imoveis, setImoveis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);
  const [favoritoIds, setFavoritoIds] = useState(new Set());
  const [pagina, setPagina] = useState(1);
  const [usarPerfil, setUsarPerfil] = useState(false);
  const [perfilProcura, setPerfilProcura] = useState(null);

  const cidadeFiltro = searchParams.get("cidade") || "";
  const tipologiaFiltro = searchParams.get("tipologia") || "";
  const precoMaxFiltro = searchParams.get("precoMax") || "";

  // Valores efetivos: perfil ou filtros manuais
  const cidadeEfetiva = usarPerfil ? (perfilProcura?.cidade || "") : cidadeFiltro;
  const tipologiaEfetiva = usarPerfil ? (perfilProcura?.tipologia || "") : tipologiaFiltro;
  const precoMaxEfetivo = usarPerfil ? (perfilProcura?.preco_max?.toString() || "") : precoMaxFiltro;

  const [precoInput, setPrecoInput] = useState(precoMaxFiltro);

  useEffect(() => {
    setLoading(true);
    setErro(null);
    getImoveis({ cidade: cidadeEfetiva, tipologia: tipologiaEfetiva })
      .then(setImoveis)
      .catch(() => setErro("Não foi possível carregar os imóveis."))
      .finally(() => setLoading(false));
  }, [cidadeEfetiva, tipologiaEfetiva]);

  // Sincronizar input de preço quando os filtros forem limpos externamente
  useEffect(() => {
    setPrecoInput(precoMaxFiltro);
  }, [precoMaxFiltro]);

  // Carregar perfil de procura se autenticado
  useEffect(() => {
    if (!utilizador) return;
    getPerfilProcura().then((p) => setPerfilProcura(p)).catch(() => {});
  }, []);

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
    setPagina(1);
  }

  function limparFiltros() {
    setSearchParams({});
    setPagina(1);
  }

  const imoveisFiltrados = precoMaxEfetivo
    ? imoveis.filter((im) => im.preco <= Number(precoMaxEfetivo))
    : imoveis;
  const totalPaginas = Math.ceil(imoveisFiltrados.length / POR_PAGINA);
  const imoveisPagina = imoveisFiltrados.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA);

  return (
    <div className="container py-5">
      <h2 className="fw-bold mb-1">{t("properties.title")}</h2>
      <p className="text-muted mb-4">
        {t("properties.found_other", { count: imoveisFiltrados.length })}
      </p>

      {/* Filtros */}
      <div className="row g-3 mb-4 align-items-end">
        <div className="col-12 col-sm-6 col-md">
          <label className="form-label fw-semibold small text-uppercase text-muted">
            {t("properties.city_label")}
          </label>
          <select
            className="form-select"
            value={cidadeEfetiva}
            disabled={usarPerfil}
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

        <div className="col-12 col-sm-6 col-md">
          <label className="form-label fw-semibold small text-uppercase text-muted">
            {t("properties.typology_label")}
          </label>
          <select
            className="form-select"
            value={tipologiaEfetiva}
            disabled={usarPerfil}
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

        <div className="col-12 col-sm-6 col-md">
          <label className="form-label fw-semibold small text-uppercase text-muted">
            Preço máximo
          </label>
          <div className="input-group">
            <input
              type="number"
              className="form-control"
              placeholder="Ex: 1200"
              min={0}
              value={usarPerfil ? precoMaxEfetivo : precoInput}
              disabled={usarPerfil}
              onChange={(e) => setPrecoInput(e.target.value)}
              onBlur={(e) => setFiltro("precoMax", e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && setFiltro("precoMax", precoInput)}
            />
            <span className="input-group-text text-muted">€/mês</span>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-md-auto">
          <div className="d-flex gap-2">
            {utilizador && perfilProcura && (
              <button
                className="btn btn-sm fw-semibold px-3 d-inline-flex align-items-center gap-2"
                style={usarPerfil
                  ? { background: "#FFC300", borderColor: "#FFC300", color: "#1a1a1a" }
                  : { background: "transparent", borderColor: "#FFC300", color: escuro ? "#FFC300" : "#1a1a1a", border: "1.5px solid #FFC300" }
                }
                onClick={() => { setUsarPerfil((v) => !v); setPagina(1); }}
              >
                <span>👤</span>
                {usarPerfil ? "Perfil ativo" : "Usar o meu perfil"}
                {usarPerfil && (
                  <span className="badge ms-1" style={{ background: "#1a1a1a", color: "#FFC300", fontSize: "0.7rem" }}>ON</span>
                )}
              </button>
            )}
            <button
              className="btn btn-outline-secondary"
              onClick={limparFiltros}
            >
              {t("properties.clear_filters")}
            </button>
          </div>
        </div>
      </div>

      {/* Chips filtros de perfil ativos */}
      {usarPerfil && perfilProcura && (
        <div className="mb-3 d-flex flex-wrap gap-2 align-items-center">
          <small className="text-muted">A filtrar por:</small>
          {perfilProcura.cidade && (
            <span className="badge rounded-pill" style={{ background: "rgba(255,195,0,0.15)", color: "#7a5c00", border: "1px solid rgba(255,195,0,0.4)" }}>
              📍 {perfilProcura.cidade}
            </span>
          )}
          {perfilProcura.tipologia && (
            <span className="badge rounded-pill" style={{ background: "rgba(255,195,0,0.15)", color: "#7a5c00", border: "1px solid rgba(255,195,0,0.4)" }}>
              🏠 {perfilProcura.tipologia}
            </span>
          )}
          {perfilProcura.preco_max && (
            <span className="badge rounded-pill" style={{ background: "rgba(255,195,0,0.15)", color: "#7a5c00", border: "1px solid rgba(255,195,0,0.4)" }}>
              💰 até {perfilProcura.preco_max}€/mês
            </span>
          )}
        </div>
      )}

      {/* Resultados */}
      {loading && <Loading />}
      {erro && (
        <div className="alert alert-danger" role="alert">
          {erro}
        </div>
      )}

      {!loading && !erro && imoveisFiltrados.length === 0 && (
        <div className="text-center py-5">
          <p className="text-muted fs-5">{t("properties.no_results")}</p>
          <button className="btn btn-dark mt-2" onClick={limparFiltros}>
            {t("properties.clear_filters")}
          </button>
        </div>
      )}

      {!loading && !erro && imoveis.length > 0 && (
        <>
          <div className="row g-4">
            {imoveisPagina.map((imovel) => (
              <div key={imovel.id} className="col-12 col-md-6 col-lg-4">
                <ImovelCard
                  imovel={imovel}
                  favorito={favoritoIds.has(imovel.id)}
                  onToggleFavorito={handleToggleFavorito}
                />
              </div>
            ))}
          </div>

          {totalPaginas > 1 && (
            <div className="d-flex justify-content-center align-items-center gap-2 mt-5">
              <button
                className="btn btn-outline-secondary btn-sm px-3"
                disabled={pagina === 1}
                onClick={() => { setPagina(p => p - 1); window.scrollTo({ top: 0, behavior: "smooth" }); }}
              >
                ‹ Anterior
              </button>

              {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  className={`btn btn-sm px-3 ${
                    n === pagina
                      ? "btn-dark fw-bold"
                      : "btn-outline-secondary"
                  }`}
                  style={n === pagina ? { background: "#1a1a1a", borderColor: "#1a1a1a" } : {}}
                  onClick={() => { setPagina(n); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                >
                  {n}
                </button>
              ))}

              <button
                className="btn btn-outline-secondary btn-sm px-3"
                disabled={pagina === totalPaginas}
                onClick={() => { setPagina(p => p + 1); window.scrollTo({ top: 0, behavior: "smooth" }); }}
              >
                Próxima ›
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
