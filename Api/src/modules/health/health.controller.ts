import { type Request, type Response } from "express";
import { healthService } from "./health.service.js";

export const getHealth = async (req: Request, res: Response) => {
    const result = await healthService.check();
    if (result.status === "ok") {
      res.json(result);
    } else {
      res.status(500).json(result);
    }
}
