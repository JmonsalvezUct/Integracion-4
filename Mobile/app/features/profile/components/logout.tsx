import { logout as clearServerAuth } from '@/services/auth';
import { apiFetch } from '@/lib/api-fetch';
import{ getRefreshToken } from '@/lib/secure-store';

// Realiza el cierre de sesión y elimina los tokens guardados
export async function performLogout() {
  try {
    await apiFetch(`/auth/logout`, {
            method: "POST",
            
            body: JSON.stringify({refreshToken: await getRefreshToken()}),
          });
    // services/auth.logout limpia secure store (access, refresh, userId)
    await clearServerAuth();
    return true;
  } catch (err) {
    console.error('performLogout falló', err);
    throw err;
  }
}

export default performLogout;
