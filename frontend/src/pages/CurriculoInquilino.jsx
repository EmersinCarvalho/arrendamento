import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getUtilizador } from "../services/auth";
import { getCurriculo, guardarCurriculo, getMe, atualizarContactos } from "../services/api";
import { useTema } from "../context/ThemeContext";
import Loading from "../components/Loading";

const SITUACOES = [
  "Empregado por conta de outrem",
  "Trabalhador independente",
  "Estudante",
  "Reformado",
  "Outro",
];

const TIPOS_CONTRATO = [
  "Contrato sem termo (efetivo)",
  "Contrato a termo certo",
  "Contrato a termo incerto",
  "Trabalho independente (recibos verdes)",
  "Estágio profissional",
  "Bolsa de investigação",
  "Não aplicável",
];

export default function CurriculoInquilino() {
  const navigate = useNavigate();
  const location = useLocation();
  const utilizador = getUtilizador();
  const { darkMode } = useTema();

  // Se o utilizador veio de uma página de imóvel, redireciona de volta após guardar
  const redirectTo = location.state?.redirectTo || null;

  const [loading, setLoading] = useState(true);
  const [a_guardar, setAGuardar] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [erro, setErro] = useState(null);

  const [form, setForm] = useState({
    situacao_profissional: "",
    tipo_contrato: "",
    profissao: "",
    rendimento_mensal: "",
    num_pessoas: "",
    tem_animais: false,
    referencias: "",
    sobre_mim: "",
    telefone: "",
  });

  useEffect(() => {
    if (!utilizador) { navigate("/login"); return; }
    if (utilizador.perfil !== "inquilino") { navigate("/"); return; }

    Promise.all([getCurriculo(), getMe()])
      .then(([dados, perfil]) => {
        setForm({
          situacao_profissional: dados?.situacao_profissional || "",
          tipo_contrato: dados?.tipo_contrato || "",
          profissao: dados?.profissao || "",
          rendimento_mensal: dados?.rendimento_mensal ?? "",
          num_pessoas: dados?.num_pessoas ?? "",
          tem_animais: !!dados?.tem_animais,
          referencias: dados?.referencias || "",
          sobre_mim: dados?.sobre_mim || "",
          telefone: perfil?.telefone || "",
        });
      })
      .finally(() => setLoading(false));
  }, []);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErro(null);
    setAGuardar(true);

    try {
      await Promise.all([
        guardarCurriculo({
          ...form,
          rendimento_mensal: form.rendimento_mensal !== "" ? Number(form.rendimento_mensal) : null,
          num_pessoas: form.num_pessoas !== "" ? Number(form.num_pessoas) : null,
        }),
        atualizarContactos({ telefone: form.telefone }),
      ]);
      setSucesso(true);

      if (redirectTo) {
        setTimeout(() => navigate(redirectTo), 1200);
      }
    } catch (err) {
      setErro(err.message || "Erro ao guardar currículo");
    } finally {
      setAGuardar(false);
    }
  }

  if (!utilizador || utilizador.perfil !== "inquilino") return null;
  if (loading) return <div className="container py-5"><Loading /></div>;

  const card = {
    background: darkMode ? "#1e1e1e" : "#fff",
    borderRadius: 16,
    boxShadow: "0 2px 16px rgba(0,0,0,0.08)",
    padding: "2rem",
    marginBottom: "1.5rem",
  };

  const label = {
    fontWeight: 600,
    fontSize: "0.88rem",
    color: darkMode ? "#ccc" : "#444",
    marginBottom: 4,
    display: "block",
  };

  return (
    <div style={{ minHeight: "100vh", background: darkMode ? "#121212" : "#f8f9fa" }}>
      {/* Header */}
      <div style={{
        background: "linear-gradient(135deg, #1a1a1a 0%, #2c2c2c 100%)",
        padding: "3rem 0 2.5rem",
      }}>
        <div className="container">
          <div className="badge fw-semibold mb-3"
            style={{ background: "rgba(255,195,0,0.15)", color: "#FFC300", fontSize: "0.7rem", letterSpacing: "1px", textTransform: "uppercase", padding: "6px 14px" }}>
            📄 Área Inquilino
          </div>
          <h1 className="text-white fw-bold mb-2" style={{ fontSize: "2rem" }}>
            Currículo Imobiliário
          </h1>
          <p className="mb-0" style={{ color: "#aaa", fontSize: "0.95rem" }}>
            O teu currículo é enviado ao senhorio quando manifestas interesse num imóvel.
          </p>
        </div>
      </div>

      <div className="container py-4" style={{ maxWidth: 720 }}>
        {redirectTo && (
          <div className="alert alert-warning border-0 mb-4"
            style={{ borderRadius: 12, background: "#fff8e1", borderLeft: "4px solid #FFC300" }}>
            <strong>⚠️ Currículo em falta</strong> — Preenche o teu currículo imobiliário para poderes manifestar interesse em imóveis.
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Situação Profissional */}
          <div style={card}>
            <h6 className="fw-bold mb-4" style={{ color: darkMode ? "#FFC300" : "#1a1a1a" }}>
              💼 Situação Profissional
            </h6>
            <div className="row g-3">
              <div className="col-12 col-sm-6">
                <label style={label}>Situação atual *</label>
                <select
                  name="situacao_profissional"
                  value={form.situacao_profissional}
                  onChange={handleChange}
                  required
                  className="form-select"
                  style={{ borderRadius: 10, background: darkMode ? "#2a2a2a" : undefined, color: darkMode ? "#e0e0e0" : undefined, borderColor: darkMode ? "#444" : undefined }}
                >
                  <option value="">Selecionar...</option>
                  {SITUACOES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="col-12 col-sm-6">
                <label style={label}>Profissão / Área *</label>
                <input
                  type="text"
                  name="profissao"
                  value={form.profissao}
                  onChange={handleChange}
                  required
                  placeholder="Ex: Engenheiro, Estudante de Medicina..."
                  className="form-control"
                  style={{ borderRadius: 10, background: darkMode ? "#2a2a2a" : undefined, color: darkMode ? "#e0e0e0" : undefined, borderColor: darkMode ? "#444" : undefined }}
                />
              </div>
              <div className="col-12 col-sm-6">
                <label style={label}>Tipo de contrato de trabalho</label>
                <select
                  name="tipo_contrato"
                  value={form.tipo_contrato}
                  onChange={handleChange}
                  className="form-select"
                  style={{ borderRadius: 10, background: darkMode ? "#2a2a2a" : undefined, color: darkMode ? "#e0e0e0" : undefined, borderColor: darkMode ? "#444" : undefined }}
                >
                  <option value="">Selecionar...</option>
                  {TIPOS_CONTRATO.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="col-12 col-sm-6">
                <label style={label}>Rendimento mensal líquido (€)</label>
                <input
                  type="number"
                  name="rendimento_mensal"
                  value={form.rendimento_mensal}
                  onChange={handleChange}
                  min={0}
                  placeholder="Ex: 1500"
                  className="form-control"
                  style={{ borderRadius: 10, background: darkMode ? "#2a2a2a" : undefined, color: darkMode ? "#e0e0e0" : undefined, borderColor: darkMode ? "#444" : undefined }}
                />
                <small className="text-muted">Opcional — ajuda o senhorio a avaliar a candidatura</small>
              </div>
              <div className="col-12 col-sm-6">
                <label style={label}>Telemóvel de contacto *</label>
                <input
                  type="tel"
                  name="telefone"
                  value={form.telefone}
                  onChange={handleChange}
                  required
                  placeholder="Ex: 912 345 678"
                  className="form-control"
                  style={{ borderRadius: 10, background: darkMode ? "#2a2a2a" : undefined, color: darkMode ? "#e0e0e0" : undefined, borderColor: darkMode ? "#444" : undefined }}
                />
                <small className="text-muted">Partilhado com o senhorio ao manifestar interesse</small>
              </div>
            </div>
          </div>

          {/* Condições de Habitação */}
          <div style={card}>
            <h6 className="fw-bold mb-4" style={{ color: darkMode ? "#FFC300" : "#1a1a1a" }}>
              🏠 Condições de Habitação
            </h6>
            <div className="row g-3">
              <div className="col-12 col-sm-6">
                <label style={label}>Número de pessoas a habitar *</label>
                <input
                  type="number"
                  name="num_pessoas"
                  value={form.num_pessoas}
                  onChange={handleChange}
                  required
                  min={1}
                  max={20}
                  placeholder="Ex: 2"
                  className="form-control"
                  style={{ borderRadius: 10, background: darkMode ? "#2a2a2a" : undefined, color: darkMode ? "#e0e0e0" : undefined, borderColor: darkMode ? "#444" : undefined }}
                />
              </div>
              <div className="col-12">
                <div
                  className="d-flex align-items-center gap-3 p-3"
                  style={{ background: darkMode ? "#2a2a2a" : "#f8f9fa", borderRadius: 10, cursor: "pointer" }}
                  onClick={() => setForm((prev) => ({ ...prev, tem_animais: !prev.tem_animais }))}
                >
                  <input
                    type="checkbox"
                    name="tem_animais"
                    checked={form.tem_animais}
                    onChange={handleChange}
                    className="form-check-input"
                    style={{ width: 20, height: 20, cursor: "pointer", accentColor: "#FFC300" }}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <div>
                    <div className="fw-semibold" style={{ fontSize: "0.9rem", color: darkMode ? "#e0e0e0" : "#1a1a1a" }}>
                      🐾 Tenho animais de estimação
                    </div>
                    <div className="text-muted" style={{ fontSize: "0.78rem" }}>
                      Sê transparente — ajuda a encontrar imóveis compatíveis
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sobre Mim */}
          <div style={card}>
            <h6 className="fw-bold mb-4" style={{ color: darkMode ? "#FFC300" : "#1a1a1a" }}>
              👤 Sobre Mim
            </h6>
            <div className="row g-3">
              <div className="col-12">
                <label style={label}>Apresentação / Carta de motivação</label>
                <textarea
                  name="sobre_mim"
                  value={form.sobre_mim}
                  onChange={handleChange}
                  rows={5}
                  placeholder="Apresenta-te brevemente. Porque estás à procura de um imóvel? Que tipo de inquilino és?"
                  className="form-control"
                  style={{ borderRadius: 10, resize: "vertical", background: darkMode ? "#2a2a2a" : undefined, color: darkMode ? "#e0e0e0" : undefined, borderColor: darkMode ? "#444" : undefined }}
                />
              </div>
              <div className="col-12">
                <label style={label}>Referências de anteriores senhorios</label>
                <textarea
                  name="referencias"
                  value={form.referencias}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Podes indicar contactos de senhorios anteriores para referência (opcional)"
                  className="form-control"
                  style={{ borderRadius: 10, resize: "vertical", background: darkMode ? "#2a2a2a" : undefined, color: darkMode ? "#e0e0e0" : undefined, borderColor: darkMode ? "#444" : undefined }}
                />
              </div>
            </div>
          </div>

          {/* Feedback */}
          {erro && (
            <div className="alert alert-danger border-0 mb-3" style={{ borderRadius: 12 }}>
              {erro}
            </div>
          )}
          {sucesso && (
            <div className="alert alert-success border-0 mb-3" style={{ borderRadius: 12 }}>
              ✅ Currículo guardado com sucesso!{redirectTo && " A redirecionar..."}
            </div>
          )}

          {/* Botões */}
          <div className="d-flex gap-3 justify-content-end flex-wrap">
            <button
              type="button"
              className="btn btn-outline-secondary"
              style={{ borderRadius: 10 }}
              onClick={() => navigate(-1)}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-warning fw-semibold px-4"
              style={{ borderRadius: 10 }}
              disabled={a_guardar}
            >
              {a_guardar ? "A guardar..." : "💾 Guardar Currículo"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
