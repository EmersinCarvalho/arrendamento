import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getUtilizador, getToken } from "../services/auth";
import { criarImovel, atualizarImovel, getImovelById, uploadFoto } from "../services/api";

const TIPOLOGIAS = ["T0", "T1", "T2", "T3", "T4+"];
const TIPOS_IMOVEL = ["Apartamento", "Moradia", "Quarto", "Estúdio"];
const CIDADES_RAPIDAS = ["Lisboa", "Porto", "Braga", "Coimbra", "Aveiro", "Faro", "Setúbal"];
const ESTADOS = ["Novo", "Segunda mão/bom estado", "Segunda mão/razoável estado", "Para recuperar"];
const AQUECIMENTOS = ["Individual", "Central", "Lareira", "Sem aquecimento"];
const TIPOS_EDIFICIO = ["Prédio", "Moradia", "Vivenda"];
const ANDARES = ["Rés-do-chão", "1º andar", "2º andar", "3º andar", "4º andar", "5º andar ou superior", "Último andar"];
const ORIENTACOES = ["Norte", "Sul", "Este", "Oeste", "Nordeste", "Noroeste", "Sudeste", "Sudoeste"];
const CERTS_ENERGETICOS = ["A+", "A", "B", "B-", "C", "D", "E", "F", "G"];

const FORM_INICIAL = {
  titulo: "",
  cidade: "",
  tipologia: "T1",
  tipo_imovel: "Apartamento",
  quartos: "",
  preco: "",
  descricao: "",
  foto: "",
  fotos: [],
  aceita_pets: false,
  mobiliado: false,
  despesas_incluidas: false,
  disponivel: true,
  // novos campos
  area: "",
  casas_banho: "",
  varanda: false,
  garagem: false,
  estado: "",
  armarios_embutidos: false,
  orientacao: [],
  cozinha_equipada: false,
  cozinha_mobilada: false,
  aquecimento: "",
  tipo_edificio: "",
  andar: "",
  elevador: false,
  certificado_energetico: "",
  meses_caucao: "",
  fianca: false,
  morada: "",
  latitude: null,
  longitude: null,
};

export default function PublicarImovel() {
  const navigate = useNavigate();
  const { id } = useParams();
  const utilizador = getUtilizador();
  const isEdicao = Boolean(id);

  const [form, setForm] = useState(FORM_INICIAL);
  const [loading, setLoading] = useState(false);
  const [loadingDados, setLoadingDados] = useState(isEdicao);
  const [erro, setErro] = useState(null);
  const [sucesso, setSucesso] = useState(false);
  const [uploadando, setUploadando] = useState(false);
  const [erroUpload, setErroUpload] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const inputFotoRef = useRef(null);
  const [geocodificando, setGeocodificando] = useState(false);
  const [erroGeo, setErroGeo] = useState(null);

  // Redirecionar se não for senhorio
  useEffect(() => {
    if (!utilizador) { navigate("/login"); return; }
    if (utilizador.perfil !== "senhorio") { navigate("/"); return; }
  }, []);

  // Carregar dados do imóvel em modo edição
  useEffect(() => {
    if (!isEdicao) return;
    setLoadingDados(true);
    getImovelById(id)
      .then((imovel) => {
        setForm({
          titulo: imovel.titulo || "",
          cidade: imovel.cidade || "",
          tipologia: imovel.tipologia || "T1",
          tipo_imovel: imovel.tipo_imovel || "Apartamento",
          quartos: imovel.quartos ?? "",
          preco: imovel.preco || "",
          descricao: imovel.descricao || "",
          foto: imovel.foto || "",
          fotos: Array.isArray(imovel.fotos) ? imovel.fotos : (imovel.foto ? [imovel.foto] : []),
          aceita_pets: Boolean(imovel.aceita_pets),
          mobiliado: Boolean(imovel.mobiliado),
          despesas_incluidas: Boolean(imovel.despesas_incluidas),
          disponivel: imovel.disponivel !== 0,
          area: imovel.area ?? "",
          casas_banho: imovel.casas_banho ?? "",
          varanda: Boolean(imovel.varanda),
          garagem: Boolean(imovel.garagem),
          estado: imovel.estado || "",
          armarios_embutidos: Boolean(imovel.armarios_embutidos),
          orientacao: imovel.orientacao ? imovel.orientacao.split(",") : [],
          cozinha_equipada: Boolean(imovel.cozinha_equipada),
          cozinha_mobilada: Boolean(imovel.cozinha_mobilada),
          aquecimento: imovel.aquecimento || "",
          tipo_edificio: imovel.tipo_edificio || "",
          andar: imovel.andar || "",
          elevador: Boolean(imovel.elevador),
          certificado_energetico: imovel.certificado_energetico || "",
          meses_caucao: imovel.meses_caucao ?? "",
          fianca: Boolean(imovel.fianca),
          morada: imovel.morada || "",
          latitude: imovel.latitude ?? null,
          longitude: imovel.longitude ?? null,
        });
      })
      .catch(() => setErro("Imóvel não encontrado."))
      .finally(() => setLoadingDados(false));
  }, [id]);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  }

  function toggleOrientacao(dir) {
    setForm((prev) => {
      const atual = prev.orientacao || [];
      return {
        ...prev,
        orientacao: atual.includes(dir)
          ? atual.filter((o) => o !== dir)
          : [...atual, dir],
      };
    });
  }

  async function handleFotoUpload(file) {
    if (!file) return;
    if (form.fotos.length >= 10) {
      setErroUpload("Máximo de 10 fotos atingido.");
      return;
    }
    setErroUpload(null);
    setUploadando(true);
    try {
      const url = await uploadFoto(file);
      setForm((p) => {
        const novas = [...p.fotos, url];
        return { ...p, fotos: novas, foto: novas[0] };
      });
    } catch (err) {
      setErroUpload(err.message);
    } finally {
      setUploadando(false);
    }
  }

  function removerFoto(idx) {
    setForm((p) => {
      const novas = p.fotos.filter((_, i) => i !== idx);
      return { ...p, fotos: novas, foto: novas[0] || "" };
    });
  }

  async function geocodificar() {
    const query = [form.morada, form.cidade, "Portugal"].filter(Boolean).join(", ");
    if (!query.trim()) { setErroGeo("Preencha a morada ou a cidade antes de localizar."); return; }
    setErroGeo(null);
    setGeocodificando(true);
    try {
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1&countrycodes=pt`;
      const res = await fetch(url, { headers: { "Accept-Language": "pt" } });
      const data = await res.json();
      if (!data.length) { setErroGeo("Endereço não encontrado. Tente ser mais específico."); return; }
      setForm((p) => ({ ...p, latitude: parseFloat(data[0].lat), longitude: parseFloat(data[0].lon) }));
    } catch {
      setErroGeo("Erro ao contactar o serviço de geocodificação.");
    } finally {
      setGeocodificando(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErro(null);
    setLoading(true);
    try {
      const dados = {
        ...form,
        preco: Number(form.preco),
        quartos: form.quartos !== "" ? Number(form.quartos) : null,
        area: form.area !== "" ? Number(form.area) : null,
        casas_banho: form.casas_banho !== "" ? Number(form.casas_banho) : null,
        orientacao: form.orientacao.length > 0 ? form.orientacao.join(",") : null,
        estado: form.estado || null,
        aquecimento: form.aquecimento || null,
        tipo_edificio: form.tipo_edificio || null,
        andar: form.andar || null,
        certificado_energetico: form.certificado_energetico || null,
        meses_caucao: form.meses_caucao !== "" ? Number(form.meses_caucao) : null,
        fianca: form.fianca,
        fotos: form.fotos,
        foto: form.fotos[0] || null,
      };
      if (isEdicao) {
        await atualizarImovel(id, dados);
      } else {
        await criarImovel(dados);
      }
      setSucesso(true);
      setTimeout(() => navigate("/meus-imoveis"), 1500);
    } catch (err) {
      setErro(err.message || "Ocorreu um erro. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  if (!utilizador || utilizador.perfil !== "senhorio") return null;

  if (loadingDados) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "60vh" }}>
        <div className="spinner-border" style={{ color: "#FFC300" }} />
      </div>
    );
  }

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
            🔑 Área Senhorio
          </div>
          <h1 className="text-white fw-bold mb-2" style={{ fontSize: "2rem" }}>
            {isEdicao ? "Editar Imóvel" : "Publicar Imóvel"}
          </h1>
          <p className="text-white-50 mb-0">
            {isEdicao
              ? "Atualize as informações do seu imóvel."
              : "Preencha os detalhes do seu imóvel e publique o seu anúncio."}
          </p>
        </div>
      </div>

      {/* Formulário */}
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            {sucesso && (
              <div
                className="alert d-flex align-items-center gap-2 mb-4"
                style={{ background: "#d4edda", border: "1px solid #c3e6cb", color: "#155724", borderRadius: 12 }}
              >
                <span style={{ fontSize: "1.2rem" }}>✅</span>
                <span>
                  {isEdicao ? "Imóvel atualizado com sucesso!" : "Imóvel publicado com sucesso!"}{" "}
                  A redirecionar...
                </span>
              </div>
            )}

            {erro && (
              <div
                className="alert d-flex align-items-center gap-2 mb-4"
                style={{ background: "#f8d7da", border: "1px solid #f5c6cb", color: "#721c24", borderRadius: 12 }}
              >
                <span style={{ fontSize: "1.2rem" }}>⚠️</span>
                <span>{erro}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Informações básicas */}
              <div
                className="p-4 mb-4"
                style={{ background: "#fff", borderRadius: 16, boxShadow: "0 2px 12px rgba(0,0,0,0.07)" }}
              >
                <h5 className="fw-bold mb-4" style={{ color: "#1a1a1a" }}>
                  📋 Informações Básicas
                </h5>

                <div className="mb-3">
                  <label className="form-label fw-semibold">Título do anúncio *</label>
                  <input
                    type="text"
                    className="form-control"
                    name="titulo"
                    value={form.titulo}
                    onChange={handleChange}
                    placeholder="Ex: Apartamento T2 moderno no centro de Lisboa"
                    required
                    style={{ borderRadius: 10, border: "1.5px solid #e0e0e0", padding: "0.65rem 1rem" }}
                  />
                </div>

                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Tipo de imóvel</label>
                    <select
                      className="form-select"
                      name="tipo_imovel"
                      value={form.tipo_imovel}
                      onChange={handleChange}
                      style={{ borderRadius: 10, border: "1.5px solid #e0e0e0", padding: "0.65rem 1rem" }}
                    >
                      {TIPOS_IMOVEL.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Tipologia</label>
                    <select
                      className="form-select"
                      name="tipologia"
                      value={form.tipologia}
                      onChange={handleChange}
                      style={{ borderRadius: 10, border: "1.5px solid #e0e0e0", padding: "0.65rem 1rem" }}
                    >
                      {TIPOLOGIAS.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Nº de quartos</label>
                    <input
                      type="number"
                      className="form-control"
                      name="quartos"
                      value={form.quartos}
                      onChange={handleChange}
                      min="0"
                      max="20"
                      placeholder="Ex: 2"
                      style={{ borderRadius: 10, border: "1.5px solid #e0e0e0", padding: "0.65rem 1rem" }}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Preço mensal (€) *</label>
                    <input
                      type="number"
                      className="form-control"
                      name="preco"
                      value={form.preco}
                      onChange={handleChange}
                      min="0"
                      placeholder="Ex: 950"
                      required
                      style={{ borderRadius: 10, border: "1.5px solid #e0e0e0", padding: "0.65rem 1rem" }}
                    />
                  </div>
                </div>
              </div>

              {/* Condições de Entrada */}
              <div className="p-4" style={{ background: "#fff", borderRadius: 16, border: "1.5px solid #e0e0e0" }}>
                <h6 className="fw-bold mb-1" style={{ color: "#1a1a1a" }}>🔐 Condições de Entrada</h6>
                <p className="text-muted mb-3" style={{ fontSize: "0.82rem" }}>
                  Defina os requisitos financeiros para o arrendamento.
                </p>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Caução (meses de renda)</label>
                    <select className="form-select" name="meses_caucao" value={form.meses_caucao} onChange={handleChange}
                      style={{ borderRadius: 10, border: "1.5px solid #e0e0e0", padding: "0.65rem 1rem" }}>
                      <option value="">Sem caução definida</option>
                      <option value="1">1 mês</option>
                      <option value="2">2 meses</option>
                      <option value="3">3 meses</option>
                      <option value="4">4 meses</option>
                      <option value="5">5 meses</option>
                      <option value="6">6 meses</option>
                    </select>
                    <div className="form-text">Valor que o inquilino paga antecipadamente como garantia.</div>
                  </div>
                  <div className="col-md-6 d-flex align-items-center">
                    <div className="d-flex align-items-start gap-3 p-3 rounded w-100"
                      style={{
                        border: `1.5px solid ${form.fianca ? "#FFC300" : "#e0e0e0"}`,
                        background: form.fianca ? "rgba(255,195,0,0.06)" : "#fafafa",
                        cursor: "pointer",
                        marginTop: 8,
                      }}
                      onClick={() => setForm((p) => ({ ...p, fianca: !p.fianca }))}>
                      <input type="checkbox" checked={form.fianca} onChange={() => {}}
                        style={{ accentColor: "#FFC300", width: 18, height: 18, marginTop: 2 }}
                        onClick={(e) => e.stopPropagation()} />
                      <div>
                        <div className="fw-semibold" style={{ fontSize: "0.9rem" }}>🤝 Fiança exigida</div>
                        <div className="text-muted" style={{ fontSize: "0.78rem" }}>
                          O inquilino terá de apresentar um fiador como garantia adicional.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Resumo das condições */}
                {(form.meses_caucao || form.fianca) && (
                  <div className="mt-3 p-3 rounded" style={{ background: "#fff8e1", border: "1.5px solid #FFC300" }}>
                    <div className="fw-semibold mb-1" style={{ fontSize: "0.85rem", color: "#1a1a1a" }}>
                      💰 Resumo das condições de entrada:
                    </div>
                    <ul className="mb-0" style={{ fontSize: "0.82rem", color: "#555" }}>
                      {form.meses_caucao && (
                        <li>
                          Caução: <strong>{form.meses_caucao} {Number(form.meses_caucao) === 1 ? "mês" : "meses"}</strong> de renda
                          {" "}= <strong>{(Number(form.preco || 0) * Number(form.meses_caucao)).toLocaleString("pt-PT")} €</strong>
                        </li>
                      )}
                      {form.fianca && <li>Fiança: fiador obrigatório</li>}
                      {form.meses_caucao && (
                        <li>
                          Total entrada estimado:{" "}
                          <strong>
                            {(Number(form.preco || 0) * (Number(form.meses_caucao) + 1)).toLocaleString("pt-PT")} €
                          </strong>{" "}
                          (caução + 1.º mês)
                        </li>
                      )}
                    </ul>
                  </div>
                )}
              </div>

              {/* Localização */}
              <div
                className="p-4 mb-4"
                style={{ background: "#fff", borderRadius: 16, boxShadow: "0 2px 12px rgba(0,0,0,0.07)" }}
              >
                <h5 className="fw-bold mb-4" style={{ color: "#1a1a1a" }}>
                  📍 Localização
                </h5>
                <div className="mb-3">
                  <label className="form-label fw-semibold">Cidade *</label>
                  <input
                    type="text"
                    className="form-control"
                    name="cidade"
                    value={form.cidade}
                    onChange={handleChange}
                    placeholder="Ex: Lisboa"
                    required
                    style={{ borderRadius: 10, border: "1.5px solid #e0e0e0", padding: "0.65rem 1rem" }}
                  />
                  <div className="d-flex flex-wrap gap-2 mt-2">
                    {CIDADES_RAPIDAS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setForm((p) => ({ ...p, cidade: c }))}
                        className="btn btn-sm"
                        style={{
                          borderRadius: 20,
                          border: `1.5px solid ${form.cidade === c ? "#FFC300" : "#e0e0e0"}`,
                          background: form.cidade === c ? "#FFC300" : "#fff",
                          color: form.cidade === c ? "#1a1a1a" : "#666",
                          fontWeight: form.cidade === c ? "600" : "400",
                          fontSize: "0.8rem",
                        }}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Morada + geocoding */}
                <div className="mb-2">
                  <label className="form-label fw-semibold">Morada (rua e número)</label>
                  <div className="d-flex gap-2">
                    <input
                      type="text"
                      className="form-control"
                      name="morada"
                      value={form.morada}
                      onChange={handleChange}
                      placeholder="Ex: Rua Augusta, 100"
                      style={{ borderRadius: 10, border: "1.5px solid #e0e0e0", padding: "0.65rem 1rem" }}
                    />
                    <button type="button" onClick={geocodificar} disabled={geocodificando}
                      className="btn btn-warning fw-semibold"
                      style={{ borderRadius: 10, whiteSpace: "nowrap", minWidth: 120 }}>
                      {geocodificando ? (
                        <><span className="spinner-border spinner-border-sm me-1" />A localizar...</>
                      ) : "📍 Localizar"}
                    </button>
                  </div>
                  {erroGeo && <div className="text-danger mt-1" style={{ fontSize: "0.82rem" }}>⚠️ {erroGeo}</div>}
                  {form.latitude && form.longitude && !erroGeo && (
                    <div className="mt-1 d-flex align-items-center gap-2" style={{ fontSize: "0.82rem", color: "#198754" }}>
                      ✅ Localização marcada no mapa
                      <button type="button" className="btn btn-sm btn-link text-danger p-0"
                        style={{ fontSize: "0.78rem" }}
                        onClick={() => setForm((p) => ({ ...p, latitude: null, longitude: null }))}>
                        Remover
                      </button>
                    </div>
                  )}
                  <div className="form-text">A localização no mapa é aproximada e não revela o endereço exato.</div>
                </div>
              </div>

              {/* Descrição e foto */}
              <div
                className="p-4 mb-4"
                style={{ background: "#fff", borderRadius: 16, boxShadow: "0 2px 12px rgba(0,0,0,0.07)" }}
              >
                <h5 className="fw-bold mb-4" style={{ color: "#1a1a1a" }}>
                  📝 Descrição e Foto
                </h5>
                <div className="mb-3">
                  <label className="form-label fw-semibold">Descrição</label>
                  <textarea
                    className="form-control"
                    name="descricao"
                    value={form.descricao}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Descreva o imóvel: localização, características, transportes próximos..."
                    style={{ borderRadius: 10, border: "1.5px solid #e0e0e0", padding: "0.65rem 1rem", resize: "vertical" }}
                  />
                </div>
                <div className="mb-2">
                  <label className="form-label fw-semibold">
                    Fotos do imóvel
                    <span className="text-muted fw-normal ms-2" style={{ fontSize: "0.82rem" }}>
                      ({form.fotos.length}/10) — a 1.ª foto é a capa
                    </span>
                  </label>

                  {/* Grid de fotos existentes */}
                  {form.fotos.length > 0 && (
                    <div className="d-flex flex-wrap gap-2 mb-3">
                      {form.fotos.map((url, idx) => (
                        <div key={url + idx} style={{ position: "relative", width: 110, height: 85 }}>
                          <img src={url} alt={`Foto ${idx + 1}`}
                            style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 8,
                              border: idx === 0 ? "2.5px solid #FFC300" : "1.5px solid #e0e0e0" }} />
                          {idx === 0 && (
                            <span style={{
                              position: "absolute", top: 4, left: 4,
                              background: "#FFC300", color: "#1a1a1a",
                              fontSize: "0.6rem", fontWeight: 700, padding: "1px 5px", borderRadius: 4,
                            }}>CAPA</span>
                          )}
                          <button type="button"
                            onClick={() => removerFoto(idx)}
                            style={{
                              position: "absolute", top: 3, right: 3,
                              width: 20, height: 20, borderRadius: "50%",
                              background: "rgba(0,0,0,0.65)", color: "#fff",
                              border: "none", cursor: "pointer", fontSize: "0.7rem",
                              display: "flex", alignItems: "center", justifyContent: "center",
                              lineHeight: 1,
                            }}>✕</button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Zona de adicionar foto */}
                  {form.fotos.length < 10 && (
                    <div
                      onClick={() => inputFotoRef.current?.click()}
                      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                      onDragLeave={() => setDragOver(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setDragOver(false);
                        Array.from(e.dataTransfer.files || []).forEach((f) => handleFotoUpload(f));
                      }}
                      style={{
                        border: `2px dashed ${dragOver ? "#FFC300" : "#e0e0e0"}`,
                        borderRadius: 12,
                        background: dragOver ? "rgba(255,195,0,0.06)" : "#fafafa",
                        cursor: "pointer",
                        minHeight: 120,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        transition: "border-color 0.2s, background 0.2s",
                      }}
                    >
                      <div className="text-center p-3">
                        {uploadando ? (
                          <>
                            <div className="spinner-border mb-2" style={{ color: "#FFC300", width: 30, height: 30 }} />
                            <div className="text-muted" style={{ fontSize: "0.82rem" }}>A carregar...</div>
                          </>
                        ) : (
                          <>
                            <div style={{ fontSize: "2rem", marginBottom: 4 }}>📂</div>
                            <div className="fw-semibold mb-1" style={{ fontSize: "0.88rem" }}>
                              {form.fotos.length === 0 ? "Clique ou arraste imagens" : "Adicionar mais fotos"}
                            </div>
                            <div className="text-muted" style={{ fontSize: "0.78rem" }}>
                              JPEG, PNG ou WebP · máx. 8 MB por foto
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  )}

                  <input
                    ref={inputFotoRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    style={{ display: "none" }}
                    onChange={(e) => Array.from(e.target.files || []).forEach((f) => handleFotoUpload(f))}
                  />

                  {erroUpload && (
                    <div className="text-danger mt-2" style={{ fontSize: "0.82rem" }}>⚠️ {erroUpload}</div>
                  )}
                </div>
              </div>

              {/* Extras */}
              <div
                className="p-4 mb-4"
                style={{ background: "#fff", borderRadius: 16, boxShadow: "0 2px 12px rgba(0,0,0,0.07)" }}
              >
                <h5 className="fw-bold mb-4" style={{ color: "#1a1a1a" }}>
                  ✨ Características Adicionais
                </h5>
                <div className="row g-3">
                  {[
                    { name: "aceita_pets", label: "🐾 Aceita animais de estimação" },
                    { name: "mobiliado", label: "🛋️ Mobilado" },
                    { name: "despesas_incluidas", label: "💡 Despesas incluídas" },
                    { name: "disponivel", label: "✅ Disponível para arrendamento" },
                  ].map(({ name, label }) => (
                    <div key={name} className="col-md-6">
                      <div
                        className="d-flex align-items-center gap-3 p-3"
                        style={{
                          borderRadius: 10,
                          border: `1.5px solid ${form[name] ? "#FFC300" : "#e0e0e0"}`,
                          background: form[name] ? "rgba(255,195,0,0.06)" : "#fafafa",
                          cursor: "pointer",
                          transition: "all 0.2s",
                        }}
                        onClick={() => setForm((p) => ({ ...p, [name]: !p[name] }))}
                      >
                        <input
                          type="checkbox"
                          name={name}
                          checked={form[name]}
                          onChange={handleChange}
                          style={{ accentColor: "#FFC300", width: 18, height: 18 }}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <span className="fw-semibold" style={{ fontSize: "0.9rem", color: "#1a1a1a" }}>
                          {label}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Características específicas */}
              <div
                className="p-4 mb-4"
                style={{ background: "#fff", borderRadius: 16, boxShadow: "0 2px 12px rgba(0,0,0,0.07)" }}
              >
                <h5 className="fw-bold mb-4" style={{ color: "#1a1a1a" }}>
                  🏗️ Características Específicas <span className="text-muted fw-normal" style={{ fontSize: "0.8rem" }}>(opcional)</span>
                </h5>
                <div className="row g-3">
                  <div className="col-md-4">
                    <label className="form-label fw-semibold">Área bruta (m²)</label>
                    <input type="number" className="form-control" name="area" value={form.area}
                      onChange={handleChange} min="0" placeholder="Ex: 86"
                      style={{ borderRadius: 10, border: "1.5px solid #e0e0e0", padding: "0.65rem 1rem" }} />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label fw-semibold">Casas de banho</label>
                    <input type="number" className="form-control" name="casas_banho" value={form.casas_banho}
                      onChange={handleChange} min="0" max="10" placeholder="Ex: 1"
                      style={{ borderRadius: 10, border: "1.5px solid #e0e0e0", padding: "0.65rem 1rem" }} />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label fw-semibold">Estado</label>
                    <select className="form-select" name="estado" value={form.estado} onChange={handleChange}
                      style={{ borderRadius: 10, border: "1.5px solid #e0e0e0", padding: "0.65rem 1rem" }}>
                      <option value="">Selecionar...</option>
                      {ESTADOS.map((e) => <option key={e} value={e}>{e}</option>)}
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Aquecimento</label>
                    <select className="form-select" name="aquecimento" value={form.aquecimento} onChange={handleChange}
                      style={{ borderRadius: 10, border: "1.5px solid #e0e0e0", padding: "0.65rem 1rem" }}>
                      <option value="">Selecionar...</option>
                      {AQUECIMENTOS.map((a) => <option key={a} value={a}>{a}</option>)}
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Tipo de edifício</label>
                    <select className="form-select" name="tipo_edificio" value={form.tipo_edificio} onChange={handleChange}
                      style={{ borderRadius: 10, border: "1.5px solid #e0e0e0", padding: "0.65rem 1rem" }}>
                      <option value="">Selecionar...</option>
                      {TIPOS_EDIFICIO.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Andar</label>
                    <select className="form-select" name="andar" value={form.andar} onChange={handleChange}
                      style={{ borderRadius: 10, border: "1.5px solid #e0e0e0", padding: "0.65rem 1rem" }}>
                      <option value="">Selecionar...</option>
                      {ANDARES.map((a) => <option key={a} value={a}>{a}</option>)}
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Certificado energético</label>
                    <select className="form-select" name="certificado_energetico" value={form.certificado_energetico} onChange={handleChange}
                      style={{ borderRadius: 10, border: "1.5px solid #e0e0e0", padding: "0.65rem 1rem" }}>
                      <option value="">Selecionar...</option>
                      {CERTS_ENERGETICOS.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>

                {/* Orientação (multi-toggle) */}
                <div className="mt-3">
                  <label className="form-label fw-semibold">Orientação</label>
                  <div className="d-flex flex-wrap gap-2">
                    {ORIENTACOES.map((dir) => (
                      <button key={dir} type="button"
                        onClick={() => toggleOrientacao(dir)}
                        className="btn btn-sm"
                        style={{
                          borderRadius: 20,
                          border: `1.5px solid ${form.orientacao.includes(dir) ? "#FFC300" : "#e0e0e0"}`,
                          background: form.orientacao.includes(dir) ? "#FFC300" : "#fff",
                          color: form.orientacao.includes(dir) ? "#1a1a1a" : "#666",
                          fontWeight: form.orientacao.includes(dir) ? 600 : 400,
                          fontSize: "0.82rem",
                        }}>
                        {dir}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Checkboxes extras */}
                <div className="row g-2 mt-2">
                  {[
                    { name: "varanda", label: "🌿 Varanda" },
                    { name: "garagem", label: "🚗 Garagem" },
                    { name: "armarios_embutidos", label: "🗄️ Armários embutidos" },
                    { name: "cozinha_equipada", label: "🍳 Cozinha equipada" },
                    { name: "cozinha_mobilada", label: "🍽️ Cozinha mobilada" },
                    { name: "elevador", label: "🛗 Elevador" },
                  ].map(({ name, label }) => (
                    <div key={name} className="col-md-6 col-lg-4">
                      <div className="d-flex align-items-center gap-2 p-2 rounded"
                        style={{
                          border: `1.5px solid ${form[name] ? "#FFC300" : "#e0e0e0"}`,
                          background: form[name] ? "rgba(255,195,0,0.06)" : "#fafafa",
                          cursor: "pointer",
                        }}
                        onClick={() => setForm((p) => ({ ...p, [name]: !p[name] }))}
                      >
                        <input type="checkbox" checked={form[name]} onChange={() => {}}
                          style={{ accentColor: "#FFC300", width: 16, height: 16 }}
                          onClick={(e) => e.stopPropagation()} />
                        <span style={{ fontSize: "0.85rem", fontWeight: 500 }}>{label}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Botões */}
              <div className="d-flex gap-3">
                <button
                  type="button"
                  className="btn btn-outline-secondary flex-grow-1"
                  style={{ borderRadius: 10, padding: "0.75rem" }}
                  onClick={() => navigate("/meus-imoveis")}
                  disabled={loading}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn fw-bold flex-grow-1"
                  style={{
                    background: loading || sucesso ? "#ccc" : "#FFC300",
                    color: "#1a1a1a",
                    borderRadius: 10,
                    padding: "0.75rem",
                    border: "none",
                    fontSize: "1rem",
                  }}
                  disabled={loading || sucesso}
                >
                  {loading
                    ? "A guardar..."
                    : sucesso
                    ? "✅ Guardado!"
                    : isEdicao
                    ? "💾 Guardar alterações"
                    : "🚀 Publicar imóvel"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
