import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { env } from '../config/env.js';
import { TOKEN } from '../config/constants.js';
interface UserPayload {
  id: number;
  email?: string;
  name?: string;
  role?: string;
}

export function generateResetToken() {
  const token = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 1000 * 60 * 30); // 30 min
  return { token, expires };
}



// 🔹 Token de acceso (JWT principal)
export function signAccessToken(user: UserPayload) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role || "user",
    },
    env.JWT_SECRET as string, // ⚠️ asegúrate que sea string
    { expiresIn: TOKEN.ACCESS_EXPIRES_IN }
  );
}




export function generateRefreshTokenValue() {
  return crypto.randomBytes(48).toString('hex');
}
