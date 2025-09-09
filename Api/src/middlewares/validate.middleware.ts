import type { Request, Response, NextFunction } from "express";
import { ZodError, ZodTypeAny } from "zod";

type Schemas = { body?: ZodTypeAny; params?: ZodTypeAny; query?: ZodTypeAny };

export function validate(schemas: Schemas) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (schemas.body) {
        const parsed = schemas.body.parse(req.body);
        (req as any).validatedBody = parsed; 
        req.body = parsed; 
      }
      if (schemas.params) {
        const parsed = schemas.params.parse(req.params);
        (req as any).validatedParams = parsed; 
      }
      if (schemas.query) {
        const parsed = schemas.query.parse(req.query);
        (req as any).validatedQuery = parsed;  
      }
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        return res.status(400).json({ message: "Validation error", errors: err.flatten() });
      }
      next(err);
    }
  };
}
