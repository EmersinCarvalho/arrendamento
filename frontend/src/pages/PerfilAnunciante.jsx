import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Loading from "../components/Loading";
import { getAvaliacoesAnunciante, submeterAvaliacao, eliminarAvaliacao, getImoveisAnunciante } from "../services/api";
import { getUtilizador } from "../services/auth";

function Estrelas({ valor, tamanho = "1rem", interativo = false, onSelecionar }) {
  const [hover, setHover] = useState(0);
  return (
    <span className="d-inline-flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <span
          key={n}
          style={{
            fontSize: tamanho,
            color: n <= (interativo ? (hover || valor) : valor) ? "#FFC300" : "#ddd",
            cursor: interativo ? "pointer" : "default",
            transition: "color 0.1s",
          }}
          onMouseEnter={() => interativo && setHover(n)}
          onMouseLeave={() => interativo && setHover(0)}
          onClick={() => interativo && onSelecionar && onSelecionar(n)}
        >
          ★
        </span>
      ))}
    </span>
  );
}

function BarraDistribuicao({ label, count, total }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="d-flex align-items-center gap-2 mb-1">
      <span style={{ fontSize: "0.8rem", minWidth: 16, textAlign: "right", color: "#555" }}>{label}</span>
      <span style={{ fontSize: "0.85rem", color: "#FFC300" }}>★</span>
      <div style={{ flex: 1, background: "#f0f0f0", borderRadius: 4, height: 8 }}>
        <div style={{ width: `${pct}%`, background: "#FFC300", borderRadius: 4, height: 8, transition: "width 0.4s" }} />
      </div>
      <span style={{ fontSize: "0.78rem", color: "#888", minWidth: 24 }}>{count}</span>
    </div>
  );
}

export default function PerfilAnunciante() {
  const { id } = useParams();
  const utilizador = getUtilizador();

  const [dados, setDados] = useState(null);
  const [imoveis, setImoveis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);
  const [tab, setTab] = useState("anuncios");

  // Formulário de avaliação
  const [novaEstrelas, setNovaEstrelas] = useState(0);
  const [novoComentario, setNovoComentario] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erroForm, setErroForm] = useState(null);
  const [sucesso, setSucesso] = useState(false);

  const carregar = () => {
    setLoading(true);
    Promise.all([
      getAvaliacoesAnunciante(id),
      getImoveisAnunciante(id),
    ])
      .then(([dadosAvaliacao, dadosImoveis]) => {
        setDados(dadosAvaliacao);
        setImoveis(dadosImoveis);
      })
      .catch(() => setErro("Anunciante não encontrado."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    carregar();
  }, [id]);

  // Pré-preencher com avaliação existente
  useEffect(() => {
    if (!dados || !utilizador) return;
    const minhaAvaliacao = dados.avaliacoes.find((a) => a.avaliador_id === utilizador.id);
    if (minhaAvaliacao) {
      setNovaEstrelas(minhaAvaliacao.estrelas);
      setNovoComentario(minhaAvaliacao.comentario || "");
    }
  }, [dados]);

  async function handleSubmeter(e) {
    e.preventDefault();
    if (novaEstrelas === 0) { setErroForm("Selecione uma classificação."); return; }
    setErroForm(null);
    setEnviando(true);
    try {
      await submeterAvaliacao(id, { estrelas: novaEstrelas, comentario: novoComentario });
      setSucesso(true);
      setTimeout(() => setSucesso(false), 3000);
      carregar();
    } catch (err) {
      setErroForm(err.message);
    } finally {
      setEnviando(false);
    }
  }

  async function handleEliminar() {
    if (!window.confirm("Tem a certeza que quer eliminar a sua avaliação?")) return;
    try {
      await eliminarAvaliacao(id);
      setNovaEstrelas(0);
      setNovoComentario("");
      carregar();
    } catch (err) {
      setErroForm(err.message);
    }
  }

  if (loading) return <div className="container py-5"><Loading /></div>;
  if (erro) return (
    <div className="container py-5 text-center">
      <p className="text-danger">{erro}</p>
      <Link to="/imoveis" className="btn btn-dark">Voltar aos imóveis</Link>
    </div>
  );

  const { anunciante, stats, avaliacoes } = dados;
  const minhaAvaliacao = utilizador ? avaliacoes.find((a) => a.avaliador_id === utilizador.id) : null;
  const podeAvaliar = utilizador && utilizador.id !== anunciante.id;

  return (
    <div style={{ minHeight: "100vh", background: "#f8f9fa" }}>
      <div className="container py-5" style={{ maxWidth: 860 }}>
        <Link to={-1} className="btn btn-outline-secondary btn-sm mb-4">← Voltar</Link>

        {/* Header do anunciante */}
        <div className="p-4 mb-4 d-flex flex-wrap align-items-center gap-4"
          style={{ background: "#fff", borderRadius: 20, boxShadow: "0 2px 16px rgba(0,0,0,0.07)" }}>
          {anunciante.foto_url ? (
            <img src={anunciante.foto_url} alt={anunciante.nome}
              style={{ width: 90, height: 90, borderRadius: "50%", objectFit: "cover", border: "3px solid #FFC300" }} />
          ) : (
            <div style={{
              width: 90, height: 90, borderRadius: "50%",
              background: "#FFC300", color: "#1a1a1a",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontWeight: "bold", fontSize: "2rem", flexShrink: 0,
            }}>
              {anunciante.nome[0].toUpperCase()}
            </div>
          )}
          <div className="flex-grow-1">
            <h2 className="fw-bold mb-1" style={{ fontSize: "1.5rem" }}>{anunciante.nome}</h2>
            <div className="text-muted" style={{ fontSize: "0.85rem" }}>
              🔑 Anunciante · Membro desde {new Date(anunciante.criado_em).toLocaleDateString("pt-PT", { month: "long", year: "numeric" })}
            </div>
            {stats.total > 0 && (
              <div className="d-flex align-items-center gap-2 mt-2">
                <Estrelas valor={Math.round(stats.media)} tamanho="1.2rem" />
                <span className="fw-bold" style={{ fontSize: "1.1rem" }}>{stats.media}</span>
                <span className="text-muted" style={{ fontSize: "0.85rem" }}>({stats.total} {stats.total === 1 ? "avaliação" : "avaliações"})</span>
              </div>
            )}
            {stats.total === 0 && (
              <div className="text-muted mt-2" style={{ fontSize: "0.85rem" }}>Ainda sem avaliações</div>
            )}
          </div>

          {/* Distribuição de estrelas */}
          {stats.total > 0 && (
            <div style={{ minWidth: 200 }}>
              <BarraDistribuicao label="5" count={stats.c5} total={stats.total} />
              <BarraDistribuicao label="4" count={stats.c4} total={stats.total} />
              <BarraDistribuicao label="3" count={stats.c3} total={stats.total} />
              <BarraDistribuicao label="2" count={stats.c2} total={stats.total} />
              <BarraDistribuicao label="1" count={stats.c1} total={stats.total} />
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="d-flex gap-2 mb-4" style={{ borderBottom: "2px solid #e0e0e0" }}>
          {[
            { key: "anuncios", label: `🏠 Anúncios (${imoveis.length})` },
            { key: "avaliacoes", label: `⭐ Avaliações (${avaliacoes.length})` },
            { key: "contatos", label: "📞 Contactos" },
          ].map(({ key, label }) => (
            <button key={key} type="button"
              onClick={() => setTab(key)}
              style={{
                background: "none", border: "none", padding: "8px 18px",
                fontWeight: tab === key ? 700 : 400,
                color: tab === key ? "#1a1a1a" : "#888",
                borderBottom: tab === key ? "3px solid #FFC300" : "3px solid transparent",
                marginBottom: -2, cursor: "pointer", fontSize: "0.95rem",
                transition: "color 0.15s",
              }}>{label}</button>
          ))}
        </div>

        {/* ── Tab: Anúncios ── */}
        {tab === "anuncios" && (
          <div>
            {imoveis.length === 0 ? (
              <div className="text-center py-5 text-muted">
                <div style={{ fontSize: "3rem" }}>🏠</div>
                <p className="mt-2">Este anunciante não tem imóveis disponíveis de momento.</p>
              </div>
            ) : (
              <div className="row g-3">
                {imoveis.map((im) => (
                  <div key={im.id} className="col-12 col-sm-6 col-lg-4">
                    <Link to={`/imoveis/${im.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                      <div className="h-100" style={{
                        background: "#fff", borderRadius: 14,
                        border: "1.5px solid #e0e0e0",
                        boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
                        overflow: "hidden",
                        transition: "box-shadow 0.2s, transform 0.2s",
                      }}
                        onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.12)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "0 2px 10px rgba(0,0,0,0.05)"; e.currentTarget.style.transform = "none"; }}>
                        {/* Foto */}
                        <div style={{ height: 160, background: "#f0f0f0", overflow: "hidden", position: "relative" }}>
                          {im.foto ? (
                            <img src={im.foto} alt={im.titulo}
                              style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          ) : (
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", fontSize: "2.5rem", color: "#ccc" }}>🏠</div>
                          )}
                          <span style={{
                            position: "absolute", top: 8, left: 8,
                            background: "#1a1a1a", color: "#FFC300",
                            fontSize: "0.7rem", fontWeight: 700,
                            padding: "2px 8px", borderRadius: 6,
                          }}>{im.tipologia}</span>
                        </div>
                        {/* Info */}
                        <div className="p-3">
                          <div className="fw-semibold mb-1" style={{ fontSize: "0.9rem", lineHeight: 1.3 }}
                            title={im.titulo}>
                            {im.titulo.length > 52 ? im.titulo.slice(0, 52) + "…" : im.titulo}
                          </div>
                          <div className="text-muted mb-2" style={{ fontSize: "0.78rem" }}>📍 {im.cidade}</div>
                          <div className="fw-bold" style={{ color: "#1a1a1a", fontSize: "1rem" }}>
                            {Number(im.preco).toLocaleString("pt-PT")} €
                            <span className="text-muted fw-normal" style={{ fontSize: "0.8rem" }}>/mês</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Tab: Avaliações ── */}
        {tab === "avaliacoes" && (
        <div className="row g-4">
          {/* Coluna esquerda: formulário de avaliação */}
          {podeAvaliar && (
            <div className="col-12 col-md-5">
              <div className="p-4" style={{ background: "#fff", borderRadius: 16, boxShadow: "0 2px 12px rgba(0,0,0,0.06)", position: "sticky", top: 80 }}>
                <h6 className="fw-bold mb-3">
                  {minhaAvaliacao ? "✏️ Editar a minha avaliação" : "⭐ Deixar uma avaliação"}
                </h6>

                <form onSubmit={handleSubmeter}>
                  <div className="mb-3">
                    <label className="form-label text-muted" style={{ fontSize: "0.85rem" }}>Classificação</label>
                    <div>
                      <Estrelas valor={novaEstrelas} tamanho="2rem" interativo onSelecionar={setNovaEstrelas} />
                      {novaEstrelas > 0 && (
                        <div className="mt-1" style={{ fontSize: "0.8rem", color: "#888" }}>
                          {["", "Muito mau", "Mau", "Razoável", "Bom", "Excelente"][novaEstrelas]}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label text-muted" style={{ fontSize: "0.85rem" }}>Comentário (opcional)</label>
                    <textarea
                      className="form-control"
                      rows={4}
                      placeholder="Partilhe a sua experiência com este anunciante..."
                      value={novoComentario}
                      onChange={(e) => setNovoComentario(e.target.value)}
                      style={{ borderRadius: 10, border: "1.5px solid #e0e0e0", resize: "none" }}
                    />
                  </div>

                  {erroForm && <div className="alert alert-danger py-2" style={{ fontSize: "0.85rem" }}>{erroForm}</div>}
                  {sucesso && <div className="alert alert-success py-2" style={{ fontSize: "0.85rem" }}>✅ Avaliação guardada!</div>}

                  <div className="d-flex gap-2">
                    <button type="submit" className="btn btn-warning fw-semibold flex-grow-1" disabled={enviando}>
                      {enviando ? "A guardar..." : minhaAvaliacao ? "Atualizar" : "Publicar"}
                    </button>
                    {minhaAvaliacao && (
                      <button type="button" className="btn btn-outline-danger" onClick={handleEliminar} title="Eliminar avaliação">
                        🗑️
                      </button>
                    )}
                  </div>
                </form>

                {!utilizador && (
                  <p className="text-muted mt-3 mb-0" style={{ fontSize: "0.82rem" }}>
                    <Link to="/login">Inicie sessão</Link> para deixar uma avaliação.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Coluna direita: lista de avaliações */}
          <div className={podeAvaliar ? "col-12 col-md-7" : "col-12"}>
            <h6 className="fw-bold mb-3">
              💬 {avaliacoes.length > 0 ? `${avaliacoes.length} ${avaliacoes.length === 1 ? "Avaliação" : "Avaliações"}` : "Sem avaliações"}
            </h6>

            {avaliacoes.length === 0 && (
              <div className="text-center py-5 text-muted">
                <div style={{ fontSize: "3rem" }}>⭐</div>
                <p className="mt-2">Ainda ninguém avaliou este anunciante.<br />Seja o primeiro!</p>
              </div>
            )}

            <div className="d-flex flex-column gap-3">
              {avaliacoes.map((av) => (
                <div key={av.id} className="p-3"
                  style={{
                    background: av.avaliador_id === utilizador?.id ? "rgba(255,195,0,0.06)" : "#fff",
                    borderRadius: 14,
                    border: av.avaliador_id === utilizador?.id ? "1.5px solid #FFC300" : "1.5px solid #e0e0e0",
                    boxShadow: "0 1px 6px rgba(0,0,0,0.04)",
                  }}>
                  <div className="d-flex align-items-center gap-2 mb-2">
                    {av.avaliador_foto ? (
                      <img src={av.avaliador_foto} alt={av.avaliador_nome}
                        style={{ width: 36, height: 36, borderRadius: "50%", objectFit: "cover" }} />
                    ) : (
                      <div style={{
                        width: 36, height: 36, borderRadius: "50%",
                        background: "#e0e0e0", color: "#555",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontWeight: "bold", fontSize: "0.9rem",
                      }}>
                        {av.avaliador_nome[0].toUpperCase()}
                      </div>
                    )}
                    <div className="flex-grow-1">
                      <div className="fw-semibold" style={{ fontSize: "0.9rem" }}>
                        {av.avaliador_nome}
                        {av.avaliador_id === utilizador?.id && (
                          <span className="ms-2 badge" style={{ background: "#FFC300", color: "#1a1a1a", fontSize: "0.65rem" }}>A minha avaliação</span>
                        )}
                      </div>
                      <div className="text-muted" style={{ fontSize: "0.75rem" }}>
                        {new Date(av.criado_em).toLocaleDateString("pt-PT", { day: "numeric", month: "long", year: "numeric" })}
                      </div>
                    </div>
                    <Estrelas valor={av.estrelas} tamanho="1rem" />
                  </div>
                  {av.comentario && (
                    <p className="mb-0" style={{ fontSize: "0.88rem", color: "#333", lineHeight: 1.6 }}>
                      {av.comentario}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
        )} {/* fim tab avaliacoes */}

        {/* ── Tab: Contactos ── */}
        {tab === "contatos" && (
          <div style={{ maxWidth: 520 }}>
            {/* Bio */}
            {anunciante.bio ? (
              <div className="p-4 mb-3" style={{ background: "#fff", borderRadius: 16, border: "1.5px solid #e0e0e0" }}>
                <div className="d-flex align-items-center gap-2 mb-2">
                  <span style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(255,195,0,0.12)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem" }}>📝</span>
                  <span className="fw-bold" style={{ fontSize: "0.95rem" }}>Sobre mim</span>
                </div>
                <p className="mb-0" style={{ fontSize: "0.92rem", color: "#444", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{anunciante.bio}</p>
              </div>
            ) : null}

            {/* Telemóvel / WhatsApp */}
            {anunciante.telefone ? (
              <div className="mb-3" style={{ background: "#fff", borderRadius: 16, border: "1.5px solid #e0e0e0", overflow: "hidden" }}>
                <div className="d-flex align-items-center gap-3 p-4">
                  <span style={{ width: 44, height: 44, borderRadius: "50%", background: "rgba(37,211,102,0.12)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.3rem", flexShrink: 0 }}>&#128241;</span>
                  <div className="flex-grow-1">
                    <div className="text-muted" style={{ fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>Telemóvel</div>
                    <div className="fw-bold" style={{ color: "#1a1a1a", fontSize: "1rem" }}>{anunciante.telefone}</div>
                  </div>
                </div>
                <a
                  href={`https://wa.me/${anunciante.telefone.replace(/[^0-9]/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="d-flex align-items-center justify-content-center gap-2 fw-bold text-white text-decoration-none py-3"
                  style={{ background: "#25D366", fontSize: "0.95rem", transition: "background 0.15s" }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "#1ebe5d"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "#25D366"}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="white">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.117.554 4.103 1.524 5.83L.057 23.57a.75.75 0 00.921.921l5.77-1.498A11.95 11.95 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.907 0-3.7-.497-5.254-1.367l-.376-.214-3.893 1.011 1.033-3.792-.233-.389A9.953 9.953 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
                  </svg>
                  Enviar mensagem no WhatsApp
                </a>
              </div>
            ) : null}

            {/* Email */}
            <a
              href={`mailto:${anunciante.email}`}
              className="d-flex align-items-center gap-3 p-4 mb-3 text-decoration-none"
              style={{ background: "#fff", borderRadius: 16, border: "1.5px solid #e0e0e0", transition: "border-color 0.2s" }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = "#FFC300"}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = "#e0e0e0"}
            >
              <span style={{ width: 44, height: 44, borderRadius: "50%", background: "rgba(66,133,244,0.12)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.3rem", flexShrink: 0 }}>✉️</span>
              <div>
                <div className="text-muted" style={{ fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>Email</div>
                <div className="fw-bold" style={{ color: "#1a1a1a", fontSize: "1rem" }}>{anunciante.email}</div>
              </div>
            </a>

            {!anunciante.bio && !anunciante.telefone && (
              <div className="text-center py-5 text-muted">
                <div style={{ fontSize: "3rem" }}>📭</div>
                <p className="mt-2">Este anunciante ainda não adicionou informações de contacto.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
