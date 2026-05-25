import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import ImovelCard from "../components/ImovelCard";
import Loading from "../components/Loading";
import { getImoveis } from "../services/api";
import { getUtilizador } from "../services/auth";
import HomeLogado from "./HomeLogado";
import logo from "../assets/logo.png";

const CIDADES = ["Lisboa", "Porto", "Braga", "Coimbra", "Faro", "Cascais"];

export default function Home() {
  const utilizador = getUtilizador();
  const { t } = useTranslation();
  const [imoveis, setImoveis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);
  const [pesquisa, setPesquisa] = useState("");
  const [tipologia, setTipologia] = useState("");

  const COMO_FUNCIONA = [
    { numero: "1", icon: "🔍", titulo: t("home.step1_title"), descricao: t("home.step1_desc") },
    { numero: "2", icon: "📋", titulo: t("home.step2_title"), descricao: t("home.step2_desc") },
    { numero: "3", icon: "🤝", titulo: t("home.step3_title"), descricao: t("home.step3_desc") },
  ];

  useEffect(() => {
    getImoveis()
      .then(setImoveis)
      .catch(() => setErro(t("properties.load_error")))
      .finally(() => setLoading(false));
  }, []);

  // Activa animação scroll-triggered
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    document.querySelectorAll(".scroll-anim").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [loading]);

  const imoveisDestaque = imoveis.slice(0, 3);

  // Utilizador autenticado → página personalizada
  if (utilizador) {
    return <HomeLogado utilizador={utilizador} />;
  }

  return (
    <>
      {/* ── HERO ── */}
      <section className="hero-landing">
        <div className="container position-relative" style={{ zIndex: 1 }}>
          <div className="row align-items-center g-5">
            {/* Texto */}
            <div className="col-12 col-lg-6 hero-anim-text">
              <div className="hero-tag">🏠 {t("home.tag")}</div>
              <h1 className="hero-title mb-4">
                {t("home.hero_title_1")}<br />
                {t("home.hero_title_2")}<br />
                <span className="highlight">ArrendaHouse</span>
              </h1>
              <p className="hero-subtitle mb-5">
                {t("home.hero_subtitle")}
              </p>
              <div className="d-flex flex-wrap gap-3">
                <Link to="/imoveis" className="btn btn-brand btn-lg">
                  {t("home.explore_btn")}
                </Link>
                <Link to="/login" className="btn btn-brand-outline btn-lg">
                  {t("home.publish_btn")}
                </Link>
              </div>
              {/* Stats */}
              <div className="hero-stats d-flex gap-4 mt-5 pt-3 hero-stats-sep">
                <div className="stat-item">
                  <div className="stat-number">500+</div>
                  <div className="stat-label">{t("home.stat_properties")}</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number">12k+</div>
                  <div className="stat-label">{t("home.stat_users")}</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number">20</div>
                  <div className="stat-label">{t("home.stat_cities")}</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number">98%</div>
                  <div className="stat-label">{t("home.stat_satisfaction")}</div>
                </div>
              </div>
            </div>

            {/* Caixa de pesquisa */}
            <div className="col-12 col-lg-5 offset-lg-1 hero-anim-search">
              <div className="hero-search-wrap">
                <div className="text-center mb-4">
                  <img
                    src={logo}
                    alt="ArrendaHouse"
                    style={{ height: 68, objectFit: "contain", marginBottom: "0.75rem" }}
                  />
                  <div className="fw-bold" style={{ fontSize: "1.2rem", letterSpacing: "-0.3px" }}>ArrendaHouse</div>
                  <p className="hero-search-label fw-semibold mb-0 small text-uppercase mt-1" style={{ letterSpacing: "1.2px" }}>
                    {t("home.quick_search")}
                  </p>
                  <div style={{ height: 2, background: "linear-gradient(90deg, transparent, #FFC300, transparent)", marginTop: "1rem", borderRadius: 2 }} />
                </div>
                <div className="d-flex flex-column gap-3">
                  <input
                    type="text"
                    className="form-control"
                    placeholder={t("home.city_placeholder")}
                    value={pesquisa}
                    onChange={(e) => setPesquisa(e.target.value)}
                  />
                  <select
                    className="form-select"
                    value={tipologia}
                    onChange={(e) => setTipologia(e.target.value)}
                  >
                    <option value="">{t("home.typology")}</option>
                    {["T0", "T1", "T2", "T3", "T4"].map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                  <Link
                    to={`/imoveis?cidade=${pesquisa}&tipologia=${tipologia}`}
                    className="btn btn-brand w-100 py-3"
                  >
                    {t("home.search_btn")}
                  </Link>
                </div>
                <div className="mt-3 d-flex flex-wrap gap-2">
                  {CIDADES.slice(0, 4).map((c) => (
                    <Link
                      key={c}
                      to={`/imoveis?cidade=${c}`}
                      className="badge text-decoration-none hero-cidade-badge"
                    >
                      {c}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── COMO FUNCIONA ── */}
      <section className="section-como-funciona">
        <div className="container">
          <div className="text-center mb-5">
            <div className="section-label">{t("home.how_it_works_label")}</div>
            <h2 className="section-title mb-3">{t("home.how_it_works_title")}</h2>
            <p className="section-subtitle">
              {t("home.how_it_works_subtitle")}
            </p>
          </div>
          <div className="row g-4 justify-content-center">
            {COMO_FUNCIONA.map((passo, i) => (
              <div key={passo.numero} className="col-12 col-md-4">
                <div className={`step-card scroll-anim${i > 0 ? ` delay-${i}` : ""}`}>
                  <div className="step-icon">{passo.icon}</div>
                  <div className="step-number">{passo.numero}</div>
                  <h4 className="fw-bold mb-2">{passo.titulo}</h4>
                  <p className="text-muted mb-0">{passo.descricao}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PARA QUEM É ── */}
      <section className="section-para-quem">
        <div className="container">
          <div className="text-center mb-5">
            <div className="section-label">{t("home.for_all_label")}</div>
            <h2 className="section-title mb-3">{t("home.for_who_title")}</h2>
            <p className="section-subtitle">
              {t("home.for_who_subtitle")}
            </p>
          </div>
          <div className="row g-4">
            <div className="col-12 col-md-6">
              <div className="perfil-card inquilino shadow-sm scroll-anim">
                <div className="perfil-icon">🏠</div>
                <h3 className="fw-bold mb-3">{t("home.tenant_title")}</h3>
                <p className="mb-4" style={{ color: "rgba(255,255,255,0.75)" }}>
                  {t("home.tenant_desc")}
                </p>
                <ul className="list-unstyled mb-4">
                  {["home.tenant_feature1", "home.tenant_feature2", "home.tenant_feature3", "home.tenant_feature4", "home.tenant_feature5"].map((feat) => (
                    <li key={feat} className="d-flex align-items-center gap-2 mb-2">
                      <span style={{ color: "#FFC300" }}>✓</span>
                      <span style={{ color: "rgba(255,255,255,0.8)", fontSize: "0.95rem" }}>{t(feat)}</span>
                    </li>
                  ))}
                </ul>
                <Link to="/login" className="btn btn-brand w-100 fw-bold">
                  {t("home.tenant_btn")}
                </Link>
              </div>
            </div>
            <div className="col-12 col-md-6">
              <div className="perfil-card senhorio shadow-sm scroll-anim delay-2">
                <div className="perfil-icon">🔑</div>
                <h3 className="fw-bold mb-3">{t("home.landlord_title")}</h3>
                <p className="mb-4" style={{ color: "rgba(26,26,26,0.7)" }}>
                  {t("home.landlord_desc")}
                </p>
                <ul className="list-unstyled mb-4">
                  {["home.landlord_feature1", "home.landlord_feature2", "home.landlord_feature3", "home.landlord_feature4", "home.landlord_feature5"].map((feat) => (
                    <li key={feat} className="d-flex align-items-center gap-2 mb-2">
                      <span style={{ color: "#1a1a1a", fontWeight: "bold" }}>✓</span>
                      <span style={{ color: "rgba(26,26,26,0.8)", fontSize: "0.95rem" }}>{t(feat)}</span>
                    </li>
                  ))}
                </ul>
                <Link to="/login" className="btn fw-bold w-100" style={{ background: "#1a1a1a", color: "#FFC300" }}>
                  {t("home.landlord_btn")}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── IMÓVEIS EM DESTAQUE ── */}
      <section className="py-5" style={{ background: "#fff" }}>
        <div className="container">
          <div className="d-flex justify-content-between align-items-center mb-5">
            <div>
              <div className="section-label">{t("home.available_now")}</div>
              <h2 className="section-title mb-0">{t("home.featured_title")}</h2>
            </div>
            <Link to="/imoveis" className="btn btn-brand fw-bold px-4">
              {t("home.see_all")}
            </Link>
          </div>

          {loading && <Loading />}
          {erro && (
            <div className="alert alert-danger" role="alert">{erro}</div>
          )}

          {!loading && !erro && (
            <div className="row g-4">
              {imoveisDestaque.map((imovel, i) => (
                <div key={imovel.id} className={`col-12 col-md-6 col-lg-4 scroll-anim${i > 0 ? ` delay-${i}` : ""}`}>
                  <ImovelCard imovel={imovel} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section style={{ background: "#FFC300", padding: "5rem 0" }}>
        <div className="container text-center scroll-anim">
          <h2 className="fw-bold mb-3" style={{ color: "#1a1a1a", fontSize: "2.2rem" }}>
            {t("home.cta_title")}
          </h2>
          <p className="mb-5" style={{ color: "rgba(26,26,26,0.7)", fontSize: "1.1rem" }}>
            {t("home.cta_subtitle")}
          </p>
          <div className="d-flex flex-wrap justify-content-center gap-3">
            <Link
              to="/imoveis"
              className="btn btn-lg fw-bold px-5"
              style={{ background: "#1a1a1a", color: "#FFC300", borderRadius: "10px" }}
            >
              {t("home.explore_btn")}
            </Link>
            <Link
              to="/login"
              className="btn btn-lg fw-bold px-5"
              style={{ background: "rgba(0,0,0,0.12)", color: "#1a1a1a", border: "2px solid rgba(0,0,0,0.2)", borderRadius: "10px" }}
            >
              {t("home.publish_btn")}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
