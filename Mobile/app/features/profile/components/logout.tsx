import { logout as clearServerAuth } from '@/services/auth';

// Realiza el cierre de sesión y elimina los tokens guardados
export async function performLogout() {
  try {
    // services/auth.logout limpia secure store (access, refresh, userId)
    await clearServerAuth();
    return true;
  } catch (err) {
    console.error('performLogout falló', err);
    throw err;
  }
}

export default performLogout;
