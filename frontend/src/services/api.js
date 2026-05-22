const API_URL = `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api`;

function getToken() {
  return localStorage.getItem("ah_token");
}

function authHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${getToken()}`,
  };
}

export async function getImoveis(filtros = {}) {
  const params = new URLSearchParams();
  if (filtros.cidade) params.append("cidade", filtros.cidade);
  if (filtros.tipologia) params.append("tipologia", filtros.tipologia);

  const response = await fetch(`${API_URL}/imoveis?${params.toString()}`);
  if (!response.ok) throw new Error("Erro ao carregar imóveis");
  return response.json();
}

export async function getImovelById(id) {
  const response = await fetch(`${API_URL}/imoveis/${id}`);
  if (!response.ok) throw new Error("Imóvel não encontrado");
  return response.json();
}

export async function registarVisualizacao(id) {
  try {
    await fetch(`${API_URL}/imoveis/${id}/visualizacao`, { method: "POST" });
  } catch { /* silencioso */ }
}

export async function getMeusImoveis() {
  const response = await fetch(`${API_URL}/imoveis/meus`, {
    headers: authHeaders(),
  });
  if (!response.ok) throw new Error("Erro ao carregar os seus imóveis");
  return response.json();
}

export async function criarImovel(dados) {
  const response = await fetch(`${API_URL}/imoveis`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(dados),
  });
  const json = await response.json();
  if (!response.ok) throw new Error(json.erro || "Erro ao publicar imóvel");
  return json;
}

export async function atualizarImovel(id, dados) {
  const response = await fetch(`${API_URL}/imoveis/${id}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(dados),
  });
  const json = await response.json();
  if (!response.ok) throw new Error(json.erro || "Erro ao atualizar imóvel");
  return json;
}

export async function eliminarImovel(id) {
  const response = await fetch(`${API_URL}/imoveis/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  const json = await response.json();
  if (!response.ok) throw new Error(json.erro || "Erro ao eliminar imóvel");
  return json;
}

// ── Favoritos ──────────────────────────────────────────────────────
export async function getFavoritos() {
  const response = await fetch(`${API_URL}/favoritos`, { headers: authHeaders() });
  if (!response.ok) return [];
  return response.json();
}

export async function getFavoritosImoveis() {
  const response = await fetch(`${API_URL}/favoritos/imoveis`, { headers: authHeaders() });
  if (!response.ok) return [];
  return response.json();
}

export async function adicionarFavorito(imovelId) {
  await fetch(`${API_URL}/favoritos/${imovelId}`, { method: "POST", headers: authHeaders() });
}

export async function removerFavorito(imovelId) {
  await fetch(`${API_URL}/favoritos/${imovelId}`, { method: "DELETE", headers: authHeaders() });
}

// ── Upload ────────────────────────────────────────────────────────
export async function uploadFoto(file) {
  const formData = new FormData();
  formData.append("foto", file);
  const response = await fetch(`${API_URL}/upload/foto`, {
    method: "POST",
    headers: { Authorization: `Bearer ${getToken()}` },
    body: formData,
  });
  const json = await response.json();
  if (!response.ok) throw new Error(json.erro || "Erro ao carregar imagem");
  return json.url;
}

// ── Avaliações ────────────────────────────────────────────────────

export async function getImoveisAnunciante(utilizadorId) {
  const response = await fetch(`${API_URL}/imoveis/anunciante/${utilizadorId}`);
  if (!response.ok) throw new Error("Erro ao carregar imóveis do anunciante");
  return response.json();
}
export async function getAvaliacoesAnunciante(utilizadorId) {
  const response = await fetch(`${API_URL}/avaliacoes/utilizador/${utilizadorId}`);
  if (!response.ok) throw new Error("Erro ao carregar avaliações");
  return response.json();
}

export async function submeterAvaliacao(utilizadorId, dados) {
  const response = await fetch(`${API_URL}/avaliacoes/utilizador/${utilizadorId}`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(dados),
  });
  const json = await response.json();
  if (!response.ok) throw new Error(json.erro || "Erro ao submeter avaliação");
  return json;
}

export async function eliminarAvaliacao(utilizadorId) {
  const response = await fetch(`${API_URL}/avaliacoes/utilizador/${utilizadorId}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  const json = await response.json();
  if (!response.ok) throw new Error(json.erro || "Erro ao eliminar avaliação");
  return json;
}

export async function getMe() {
  const response = await fetch(`${API_URL}/auth/me`, { headers: authHeaders() });
  if (!response.ok) return null;
  return response.json();
}

export async function atualizarContactos(dados) {
  const response = await fetch(`${API_URL}/auth/contactos`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(dados),
  });
  const json = await response.json();
  if (!response.ok) throw new Error(json.erro || "Erro ao atualizar contactos");
  return json;
}

// ── Currículo Imobiliário ────────────────────────────────────────

export async function getCurriculo() {
  const response = await fetch(`${API_URL}/candidaturas/curriculo`, {
    headers: authHeaders(),
  });
  if (!response.ok) return null;
  return response.json();
}

export async function guardarCurriculo(dados) {
  const response = await fetch(`${API_URL}/candidaturas/curriculo`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(dados),
  });
  const json = await response.json();
  if (!response.ok) throw new Error(json.erro || "Erro ao guardar currículo");
  return json;
}

// ── Candidaturas / Interesse ─────────────────────────────────────

export async function verificarInteresse(imovelId) {
  const response = await fetch(`${API_URL}/candidaturas/imovel/${imovelId}/estado`, {
    headers: authHeaders(),
  });
  if (!response.ok) return { jaEnviou: false };
  return response.json();
}

export async function enviarInteresse(imovelId) {
  const response = await fetch(`${API_URL}/candidaturas/imovel/${imovelId}`, {
    method: "POST",
    headers: authHeaders(),
  });
  const json = await response.json();
  if (!response.ok) throw new Error(json.erro || "Erro ao enviar interesse");
  return json;
}

export async function getCandidaturasRecebidas() {
  const response = await fetch(`${API_URL}/candidaturas/recebidas`, {
    headers: authHeaders(),
  });
  if (!response.ok) throw new Error("Erro ao carregar candidaturas");
  return response.json();
}

export async function marcarCandidaturaLida(candidaturaId) {
  await fetch(`${API_URL}/candidaturas/${candidaturaId}/lida`, {
    method: "PATCH",
    headers: authHeaders(),
  });
}
