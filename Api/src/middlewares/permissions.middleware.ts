import { can } from "../utils/checkPermission.js";
import type { Request, Response, NextFunction } from "express";

export function authorize(resource: string, action: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const role = req.user?.role;

    if (!role) return res.status(401).json({ error: "No role assigned" });

    if (!can(role, resource, action)) {
      return res.status(403).json({ error: "Not allowed" });
    }

    return next();
  };
}
