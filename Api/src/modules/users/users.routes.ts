import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import * as usersController from "./users.controller.js";

const router = Router();


router.get("/me", authMiddleware, usersController.getCurrentUser);

router.put("/me", authMiddleware, usersController.updateCurrentUser);

export default router;
