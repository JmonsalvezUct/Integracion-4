import type ms from 'ms'

export const TOKEN = {
  ACCESS_EXPIRES_IN: "15m" as ms.StringValue,     // token corto para seguridad
  REFRESH_EXPIRES_IN_DAYS: 30,  // refresh para mobile
};

export const PASSWORD = {
  SALT_ROUNDS: 10,
};