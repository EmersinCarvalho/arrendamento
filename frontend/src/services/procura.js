const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

function headers() {
  const token = localStorage.getItem("ah_token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function getPerfilProcura() {
  const res = await fetch(`${API}/api/procura/perfil`, { headers: headers() });
  if (res.status === 401) return null;
  if (!res.ok) return null;
  return res.json();
}

export async function salvarPerfilProcura(dados) {
  const res = await fetch(`${API}/api/procura/perfil`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(dados),
  });
  if (!res.ok) throw new Error("Erro ao guardar perfil de procura");
  return res.json();
}

export async function getImoveisSwipe() {
  const res = await fetch(`${API}/api/procura/imoveis`, { headers: headers() });
  if (!res.ok) throw new Error("Erro ao carregar imóveis");
  return res.json();
}
