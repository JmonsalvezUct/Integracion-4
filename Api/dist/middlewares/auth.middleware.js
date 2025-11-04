import {} from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { body, validationResult } from "express-validator";
export const authMiddleware = (req, res, next) => {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No autorizado: falta token' });
    }
    const token = header.split(' ')[1];
    try {
        const decoded = jwt.verify(token, env.JWT_SECRET);
        req.user = {
        id: decoded.id,
        email: decoded.email,
        name: decoded.name,
        role: decoded.role || "user",
        };

        next();
    }
    catch (error) {
        return res.status(401).json({ error: 'Token inválido o expirado' });
    }
};
export const validateRecoverPassword = [
    body("email").isEmail().withMessage("Email inválido"),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    },
];
export const validateResetPassword = [
    body("token").notEmpty().withMessage("El token es obligatorio"),
    body("newPassword")
        .isLength({ min: 6 })
        .withMessage("La contraseña debe tener al menos 6 caracteres"),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    },
];
//# sourceMappingURL=auth.middleware.js.map