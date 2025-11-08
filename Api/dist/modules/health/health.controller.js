import {} from "express";
import { healthService } from "./health.service.js";
export const getHealth = async (req, res) => {
    const result = await healthService.check();
    if (result.status === "ok") {
        res.json(result);
    }
    else {
        res.status(500).json(result);
    }
};
//# sourceMappingURL=health.controller.js.map