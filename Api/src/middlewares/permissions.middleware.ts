import type { Resource, Action } from "../config/permissions.js";
import type { Response, NextFunction } from "express";
import type { AuthRequest } from "./auth.middleware.js";
import { can } from "../utils/checkPermission.js";

export function authorize<R extends Resource>(
  resource: R,
  action: Action<R>
) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    const role = req.user?.role;

    if (!role) {
      return res.status(401).json({ error: "No role assigned" });
    }

    if (!can(role, resource, action)) {
      return res.status(403).json({ error: "Not allowed" });
    }

    return next();
  };
}
