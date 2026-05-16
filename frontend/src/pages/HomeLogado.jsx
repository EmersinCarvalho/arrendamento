import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import ImovelCard from "../components/ImovelCard";
import Loading from "../components/Loading";
import { getImoveis } from "../services/api";
import { logout } from "../services/auth";

const CIDADES = ["Lisboa", "Porto", "Braga", "Coimbra", "Faro", "Cascais", "Setúbal", "Aveiro"];

export default function HomeLogado({ utilizador }) {
  const [imoveis, setImoveis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pesquisa, setPesquisa] = useState("");
  const [tipologia, setTipologia] = useState("");
  const navigate = useNavigate();

  const isSenhorio = utilizador.perfil === "senhorio";

  useEffect(() => {
    getImoveis()
      .then(setImoveis)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const primeiroNome = utilizador.nome?.split(" ")[0] || "Utilizador";

  return (
    <>
      {/* ── HERO LOGADO ── */}
      <section
        style={{
          background: "linear-gradient(135deg, #1a1a1a 0%, #2c2c2c 100%)",
          minHeight: "auto",
          padding: "3.5rem 0",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Detalhe decorativo */}
        <div
          style={{
            position: "absolute", top: -60, right: -60,
            width: 300, height: 300, borderRadius: "50%",
            background: "rgba(255,195,0,0.06)", pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute", bottom: -80, left: -40,
            width: 200, height: 200, borderRadius: "50%",
            background: "rgba(255,195,0,0.04)", pointerEvents: "none",
          }}
        />

        <div className="container position-relative">
          <div className="row align-items-center g-4">
            {/* Saudação */}
            <div className="col-12 col-lg-6">
              <div className="d-flex align-items-center gap-3 mb-3">
                {utilizador.foto_url ? (
                  <img
                    src={utilizador.foto_url}
                    alt={utilizador.nome}
                    style={{
                      width: 56, height: 56, borderRadius: "50%",
                      objectFit: "cover",
                      border: "3px solid #FFC300",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: 56, height: 56, borderRadius: "50%",
                      background: "#FFC300", color: "#1a1a1a",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontWeight: "bold", fontSize: "1.4rem",
                      border: "3px solid rgba(255,195,0,0.3)",
                    }}
                  >
                    {utilizador.nome?.[0]?.toUpperCase()}
                  </div>
                )}
                <div>
                  <div
                    className="badge fw-semibold mb-1"
                    style={{
                      background: isSenhorio ? "#FFC300" : "rgba(255,195,0,0.15)",
                      color: isSenhorio ? "#1a1a1a" : "#FFC300",
                      fontSize: "0.7rem",
                      letterSpacing: "1px",
                      textTransform: "uppercase",
                      padding: "4px 10px",
                    }}
                  >
                    {isSenhorio ? "🔑 Senhorio" : "🏠 Inquilino"}
                  </div>
                  <div className="text-white-50 small">{utilizador.email}</div>
                </div>
              </div>

              <h1 className="fw-bold text-white mb-2" style={{ fontSize: "2.4rem", lineHeight: 1.2 }}>
                Olá, <span style={{ color: "#FFC300" }}>{primeiroNome}</span>!
              </h1>
              <p className="mb-4" style={{ color: "rgba(255,255,255,0.6)", fontSize: "1.1rem" }}>
                {isSenhorio
                  ? "Gira os seus imóveis, veja contactos de inquilinos e publique novos anúncios."
                  : "Encontre o seu próximo lar. Explore imóveis por cidade, tipologia ou preço."}
              </p>

              <div className="d-flex flex-wrap gap-3">
                {isSenhorio ? (
                  <>
                    <Link
                      to="/imoveis/publicar"
                      className="btn btn-lg fw-bold"
                      style={{ background: "#FFC300", color: "#1a1a1a", borderRadius: "10px" }}
                    >
                      + Publicar imóvel
                    </Link>
                    <Link
                      to="/painel"
                      className="btn btn-lg fw-semibold"
                      style={{ background: "rgba(255,255,255,0.08)", color: "#fff", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.15)" }}
                    >
                      Ver painel
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      to="/descobrir"
                      className="btn btn-lg fw-bold"
                      style={{ background: "#FFC300", color: "#1a1a1a", borderRadius: "10px" }}
                    >
                      ✨ Descobrir imóveis
                    </Link>
                    <Link
                      to="/imoveis"
                      className="btn btn-lg fw-semibold"
                      style={{ background: "rgba(255,255,255,0.08)", color: "#fff", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.15)" }}
                    >
                      🔍 Explorar lista
                    </Link>
                    <Link
                      to="/favoritos"
                      className="btn btn-lg fw-semibold"
                      style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.6)", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.1)" }}
                    >
                      ♥ Favoritos
                    </Link>
                  </>
                )}
              </div>
            </div>

            {/* Card de pesquisa rápida (inquilino) ou estatísticas (senhorio) */}
            <div className="col-12 col-lg-5 offset-lg-1">
              {!isSenhorio ? (
                <div
                  className="rounded-4 p-4"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    backdropFilter: "blur(10px)",
                  }}
                >
                  <p className="text-white fw-semibold mb-3 small text-uppercase" style={{ letterSpacing: "1px", color: "rgba(255,255,255,0.5)" }}>
                    Pesquisa rápida
                  </p>
                  <div className="d-flex flex-column gap-3">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Cidade (ex: Lisboa, Porto...)"
                      value={pesquisa}
                      onChange={(e) => setPesquisa(e.target.value)}
                      style={{ borderRadius: "10px", padding: "0.8rem 1rem" }}
                    />
                    <select
                      className="form-select"
                      value={tipologia}
                      onChange={(e) => setTipologia(e.target.value)}
                      style={{ borderRadius: "10px", padding: "0.8rem 1rem" }}
                    >
                      <option value="">Qualquer tipologia</option>
                      {["T0", "T1", "T2", "T3", "T4"].map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                    <Link
                      to={`/imoveis?cidade=${pesquisa}&tipologia=${tipologia}`}
                      className="btn fw-bold py-3"
                      style={{ background: "#FFC300", color: "#1a1a1a", borderRadius: "10px", fontSize: "1rem" }}
                    >
                      Pesquisar
                    </Link>
                  </div>
                  <div className="mt-3 d-flex flex-wrap gap-2">
                    {CIDADES.slice(0, 4).map((c) => (
                      <Link
                        key={c}
                        to={`/imoveis?cidade=${c}`}
                        className="badge text-decoration-none"
                        style={{
                          background: "rgba(255,195,0,0.12)", color: "#FFC300",
                          border: "1px solid rgba(255,195,0,0.2)",
                          padding: "6px 12px", borderRadius: "20px", fontSize: "0.78rem",
                        }}
                      >
                        {c}
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
                // Cards de ações rápidas para senhorio
                <div className="row g-3">
                  {[
                    { icon: "🏠", label: "Os meus imóveis", sub: "Gira os seus anúncios", href: "/painel" },
                    { icon: "📩", label: "Contactos", sub: "Mensagens de inquilinos", href: "/painel/contactos" },
                    { icon: "📊", label: "Estatísticas", sub: "Visualizações e interesse", href: "/painel/stats" },
                    { icon: "⚙️", label: "Conta", sub: "Perfil e definições", href: "/perfil" },
                  ].map((item) => (
                    <div className="col-6" key={item.label}>
                      <Link
                        to={item.href}
                        className="d-block text-decoration-none rounded-3 p-3"
                        style={{
                          background: "rgba(255,255,255,0.05)",
                          border: "1px solid rgba(255,255,255,0.1)",
                          transition: "all 0.2s",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "rgba(255,195,0,0.1)";
                          e.currentTarget.style.borderColor = "rgba(255,195,0,0.3)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                          e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
                        }}
                      >
                        <div style={{ fontSize: "1.6rem", marginBottom: "0.4rem" }}>{item.icon}</div>
                        <div className="fw-semibold text-white" style={{ fontSize: "0.9rem" }}>{item.label}</div>
                        <div style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.75rem" }}>{item.sub}</div>
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── IMÓVEIS EM DESTAQUE ── */}
      <section className="py-5" style={{ background: "#f8f9fa" }}>
        <div className="container">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <div className="section-label">
                {isSenhorio ? "Disponíveis na plataforma" : "Recém adicionados"}
              </div>
              <h2 className="section-title mb-0">Imóveis em destaque</h2>
            </div>
            <Link to="/imoveis" className="btn fw-bold px-4" style={{ background: "#FFC300", color: "#1a1a1a", borderRadius: "8px" }}>
              Ver todos
            </Link>
          </div>

          {loading && <Loading />}
          {!loading && imoveis.length === 0 && (
            <div className="text-center py-5">
              <div style={{ fontSize: "3rem" }}>🏠</div>
              <p className="text-muted mt-2">Nenhum imóvel disponível de momento.</p>
            </div>
          )}
          {!loading && imoveis.length > 0 && (
            <div className="row g-4">
              {imoveis.slice(0, 3).map((imovel) => (
                <div key={imovel.id} className="col-12 col-md-6 col-lg-4">
                  <ImovelCard imovel={imovel} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── CTA ESPECÍFICO DO PERFIL ── */}
      {isSenhorio ? (
        <section style={{ background: "#FFC300", padding: "4rem 0" }}>
          <div className="container text-center">
            <h2 className="fw-bold mb-2" style={{ color: "#1a1a1a", fontSize: "2rem" }}>
              Tem um imóvel para arrendar?
            </h2>
            <p className="mb-4" style={{ color: "rgba(26,26,26,0.65)", fontSize: "1.05rem" }}>
              Publique gratuitamente e chegue a milhares de inquilinos.
            </p>
            <Link
              to="/imoveis/publicar"
              className="btn btn-lg fw-bold px-5"
              style={{ background: "#1a1a1a", color: "#FFC300", borderRadius: "10px" }}
            >
              + Publicar imóvel agora
            </Link>
          </div>
        </section>
      ) : (
        <section style={{ background: "#1a1a1a", padding: "4rem 0" }}>
          <div className="container text-center">
            <h2 className="fw-bold mb-2 text-white" style={{ fontSize: "2rem" }}>
              Não encontrou o que procura?
            </h2>
            <p className="mb-4" style={{ color: "rgba(255,255,255,0.55)", fontSize: "1.05rem" }}>
              Explore todos os imóveis disponíveis ou afine os filtros de pesquisa.
            </p>
            <div className="d-flex flex-wrap justify-content-center gap-3">
              <Link
                to="/imoveis"
                className="btn btn-lg fw-bold px-5"
                style={{ background: "#FFC300", color: "#1a1a1a", borderRadius: "10px" }}
              >
                Ver todos os imóveis
              </Link>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
