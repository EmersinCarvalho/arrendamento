const API_URL = "http://localhost:5000/api";

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
