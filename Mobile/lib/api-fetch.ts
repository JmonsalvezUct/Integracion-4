// lib/api-fetch.ts
import { API_URL } from "@/constants/api";
import { getAccessToken } from "@/lib/secure-store";
import { refreshTokens, logout } from "@/services/auth";

export async function apiFetch(
  path: string,
  options: RequestInit = {},
  _retry = false
) {
  const access = await getAccessToken();
  const headers = {
    ...(options.headers || {}),
    "Content-Type": "application/json",
    ...(access ? { Authorization: `Bearer ${access}` } : {}),
  };

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (res.status === 401 && !_retry) {
    try {
      await refreshTokens(); // renueva tokens
      return apiFetch(path, options, true); // reintenta una vez
    } catch {
      await logout();
    }
  }

  return res;
}
