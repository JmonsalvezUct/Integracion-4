import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import {
  getMembers,
  updateMemberRole,
  removeMember
} from "./members.controller.js";

const router = Router({ mergeParams: true });

router.get("/", authMiddleware, getMembers);
router.put("/:userId", authMiddleware, updateMemberRole);
router.delete("/:userId", authMiddleware, removeMember);

export default router;
