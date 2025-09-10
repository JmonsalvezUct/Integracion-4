import bcrypt from 'bcrypt';
import { addDays } from 'date-fns';
import { PASSWORD, TOKEN } from '../../config/constants.js';
import { authRepository } from './auth.repository.js';
import type { RegisterDTO, LoginDTO } from './auth.validators.js';
import { sendRecoveryEmail } from '../services/email.js';
import { signAccessToken, generateRefreshTokenValue, generateResetToken } from '../../utils/token.js';

export const authService = {
  async register(payload: RegisterDTO) {
    const exists = await authRepository.findUserByEmail(payload.email);
    if (exists) throw new Error('EMAIL_TAKEN');

    const hashed = await bcrypt.hash(payload.password, PASSWORD.SALT_ROUNDS);
    const user = await authRepository.createUser({
      name: payload.name,
      email: payload.email,
      password: hashed,
      profilePicture: payload.profilePicture,
    });

    const accessToken = signAccessToken(user.id);
    const refreshToken = generateRefreshTokenValue();
    const expiresAt = addDays(new Date(), TOKEN.REFRESH_EXPIRES_IN_DAYS);

    await authRepository.createRefreshToken({
      token: refreshToken,
      userId: user.id,
      expiresAt,
      userAgent: 'registration', // opcional: puedes pasar req.headers['user-agent']
    });

    return {
      accessToken,
      refreshToken,
      user: { id: user.id, name: user.name, email: user.email, profilePicture: user.profilePicture },
    };
  },

  async login(payload: LoginDTO, userAgent?: string) {
    const user = await authRepository.findUserByEmail(payload.email);
    if (!user) throw new Error('INVALID_CREDENTIALS');

    const ok = await bcrypt.compare(payload.password, user.password);
    if (!ok) throw new Error('INVALID_CREDENTIALS');

    const accessToken = signAccessToken(user.id);
    const refreshToken = generateRefreshTokenValue();
    const expiresAt = addDays(new Date(), TOKEN.REFRESH_EXPIRES_IN_DAYS);

    await authRepository.createRefreshToken({
      token: refreshToken,
      userId: user.id,
      expiresAt,
      userAgent,
    });

    return {
      accessToken,
      refreshToken,
      user: { id: user.id, name: user.name, email: user.email, profilePicture: user.profilePicture },
    };
  },

  async refresh(refreshToken: string, userAgent?: string) {
    const record = await authRepository.findRefreshToken(refreshToken);
    if (!record) throw new Error('REFRESH_NOT_FOUND');
    if (record.expiresAt < new Date()) {
      await authRepository.deleteRefreshToken(refreshToken);
      throw new Error('REFRESH_EXPIRED');
    }

    const accessToken = signAccessToken(record.userId);

    const newRefresh = generateRefreshTokenValue();
    const expiresAt = addDays(new Date(), TOKEN.REFRESH_EXPIRES_IN_DAYS);

    await authRepository.deleteRefreshToken(refreshToken);
    await authRepository.createRefreshToken({
      token: newRefresh,
      userId: record.userId,
      expiresAt,
      userAgent,
    });

    return { accessToken, refreshToken: newRefresh };
  },

  async logout(refreshToken: string) {
    try {
      await authRepository.deleteRefreshToken(refreshToken);
    } catch (error){
      console.error('Error al intentar cerrar la sesión', error);
    }
  },

  async getProfile(userId: number) {
    try {
      await authRepository.findUserById(userId);
    } catch (error){
      console.error('Error al intentar obtener perfil', error);
    }
  },

  async recoverPassword(email: string) {
    const user = await authRepository.findUserByEmail(email);

    if (!user) {
      // Respuesta genérica para no revelar información
      return { message: "Si el correo existe, enviaremos un enlace de recuperación." };
    }

    const { token, expires } = generateResetToken();

    await authRepository.saveResetToken(email, token, expires);

    const resetLink = `http://localhost:3000/reset-password?token=${token}`;
    await sendRecoveryEmail(email, resetLink);

    return { message: "Si el correo existe, enviaremos un enlace de recuperación." };
  }
};
