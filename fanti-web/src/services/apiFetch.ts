export async function apiFetch(url: string, options: RequestInit = {}) {
  const token = typeof window === "undefined"
    ? undefined
    : localStorage.getItem("access_token");

  const headers = {
    ...(options.headers || {}),
    Authorization: token ? `Bearer ${token}` : "",
    "Content-Type": "application/json",
  };

  const response = await fetch(url, { ...options, headers });

  // Middleware de erro global
  if (response.status === 401) {
    console.warn("Sessão expirada — redirecionando para login");
    if (typeof window !== "undefined") window.location.href = "/login";
  }

  return response;
}