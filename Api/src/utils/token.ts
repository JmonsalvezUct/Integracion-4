import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { env } from '../config/env.js';
import { TOKEN } from '../config/constants.js';

export function generateResetToken() {
  const token = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 1000 * 60 * 30); // 30 min
  return { token, expires };
}

export function signAccessToken(userId: number) {
  return jwt.sign({ id: userId }, env.JWT_SECRET, { expiresIn: TOKEN.ACCESS_EXPIRES_IN });
}

export function generateRefreshTokenValue() {
  return crypto.randomBytes(48).toString('hex');
}
