// lib/secure-store.ts (guardar/leer/borrar tokens e id en el dispositivo)
import * as SecureStore from "expo-secure-store";

export const StorageKey = {
  accessToken: "accessToken",
  refreshToken: "refreshToken",
  userId: "userId",
} as const;

export async function saveAuth(params: {
  accessToken: string;
  refreshToken: string;
  userId: string | number;
}) {
  await SecureStore.setItemAsync(StorageKey.accessToken, params.accessToken);
  await SecureStore.setItemAsync(StorageKey.refreshToken, params.refreshToken);
  await SecureStore.setItemAsync(StorageKey.userId, String(params.userId));
}

export async function getAccessToken() {
  return SecureStore.getItemAsync(StorageKey.accessToken);
}

export async function getRefreshToken() {
  return SecureStore.getItemAsync(StorageKey.refreshToken);
}

export async function getUserId() {
  return SecureStore.getItemAsync(StorageKey.userId);
}

export async function clearAuth() {
  await SecureStore.deleteItemAsync(StorageKey.accessToken);
  await SecureStore.deleteItemAsync(StorageKey.refreshToken);
  await SecureStore.deleteItemAsync(StorageKey.userId);
}

export async function isLoggedIn() {
  const t = await getAccessToken();
  return !!t;
}
