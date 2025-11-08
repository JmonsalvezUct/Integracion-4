import type { Request, Response, NextFunction } from "express";
import type { AuthRequest } from "./auth.middleware.js";


export function roleMiddleware(allowedRoles: string[]) {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        const userRole = req.user?.role;
        if (!userRole) {
        return res.status(403).json({ error: "Acceso denegado: usuario sin rol asignado" });
        }

        if (!allowedRoles.includes(userRole)) { 
        return res.status(403).json({ error: "Acceso denegado: rol insuficiente" });
        }

        next();
    };
}
