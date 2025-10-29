import * as SecureStore from "expo-secure-store";

const RAW = (process.env.EXPO_PUBLIC_API_URL ?? "https://integracion-4-gsyz.onrender.com/api").trim();

export const API_URL = RAW.replace(/\/+$/, "");

//https://integracion-4-gsyz.onrender.com/api

const buildUrl = (path: string) => `${API_URL}${path.startsWith("/") ? path : `/${path}`}`;

// Fetch genérico (sin auth)
export async function apiFetch(path: string, init: RequestInit = {}) {
  const res = await fetch(buildUrl(path), {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
  });
  return res;
}

// Fetch con Authorization tomado del SecureStore
export async function authFetch(path: string, init: RequestInit = {}) {
  const token = await SecureStore.getItemAsync("token");
  return apiFetch(path, {
    ...init,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init.headers || {}),
    },
  });
}
