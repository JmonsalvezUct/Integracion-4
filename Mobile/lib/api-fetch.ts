// lib/api-fetch.ts
import { API_URL } from "@/constants/api";
import { getAccessToken } from "@/lib/secure-store";
import { refreshTokens, logout } from "@/services/auth";
import * as SecureStore from "expo-secure-store";
import { StorageKey } from "@/lib/secure-store";

// Normaliza la ruta (acepta "tasks" o "/tasks")
function buildUrl(path: string) {
  return `${API_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

function isFormDataBody(options?: RequestInit) {
  return options?.body instanceof FormData;
}

export async function apiFetch(
  path: string,
  options: RequestInit = {},
  _retry = false
) {
  
  const access = await getAccessToken();

    //Determina si debe agregar el header, si el body es FormData, no lo agrega
  const baseHeaders = isFormDataBody(options)
    ? { ...(options.headers || {}) }
    : { "Content-Type": "application/json", ...(options.headers || {}) };

  const headers = {
    ...baseHeaders,
    ...(access ? { Authorization: `Bearer ${access}` } : {}),
  };

  const res = await fetch(buildUrl(path), { ...options, headers });
  if (res.status === 401 && !_retry) {
    console.warn("apiFetch: error 401 detectado en", path, "— intentando renovar el token de acceso");

    // Si otra petición ya está refrescando el token, espera a que termine
    try {
      await withRefresh();
      //Cuando el refresh termina con éxito, reintenta la petición original una vez
      return apiFetch(path, options, true);
    } catch (err) {
      // Si el refresh falla, cierra la sesión y lanza el error
      try {
        await logout();
      } catch {}
      throw err;
    }
  }

  return res;
}

// Evita múltiples refresh simultáneos
let _refreshPromise: Promise<any> | null = null;
async function withRefresh() {
  if (_refreshPromise) return _refreshPromise;

  _refreshPromise = (async () => {
    try {
      console.log("apiFetch: iniciando actualización del token");
      const data = await refreshTokens();
      console.log("apiFetch: actualización exitosa");
      return data;
    } catch (err) {
      console.error("apiFetch: actualización fallida:", err);
      throw err;
    } finally {
      _refreshPromise = null;
    }
  })();

  return _refreshPromise;
}

// Helper expuesto (si lo necesitas desde aquí)
export async function getRefreshToken() {
  return SecureStore.getItemAsync(StorageKey.refreshToken);
}