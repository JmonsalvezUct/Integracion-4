// services/auth.ts
import { API_URL } from "@/constants/api";
import { saveAuth } from "@/lib/secure-store";

export type LoginResponse = {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string | number;
    name: string;
    email: string;
    profilePicture?: string | null;
  };
};

export async function login(email: string, password: string): Promise<LoginResponse> {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    // opcional: leer mensaje de error del backend
    const msg = await res.text();
    throw new Error(msg || `HTTP ${res.status}`);
  }

  const data = (await res.json()) as LoginResponse;

  // >>> Guarda lo que te pidieron:
  await saveAuth({
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
    userId: data.user.id,
  });

  return data;
}
