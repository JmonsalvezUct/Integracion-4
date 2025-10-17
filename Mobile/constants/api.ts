const RAW = (process.env.EXPO_PUBLIC_API_URL ?? "https://integracion-4.onrender.com/api").trim();
export const API_URL = RAW.replace(/\/+$/, "");
