// Gestão do token JWT no localStorage

const TOKEN_KEY = "ah_token";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export function logout() {
  removeToken();
  window.location.href = "/";
}

export function isAutenticado() {
  return !!getToken();
}

// Lê o payload do JWT sem verificar assinatura (apenas no frontend)
export function getUtilizador() {
  const token = getToken();
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    // Verificar se não expirou
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      removeToken();
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}
