import { Router } from "express";
import {
  createInvitation,
  listProjectInvitations,
  listMyInvitations,
  acceptInvitation,
  rejectInvitation,
} from "./invitations.controller.js";

import { authMiddleware } from "../../middlewares/auth.middleware.js";

const router = Router();


router.post(
  "/projects/:projectId/invitations",
  authMiddleware,
  createInvitation
);

router.get(
  "/projects/:projectId/invitations",
  authMiddleware,
  listProjectInvitations
);


router.get(
  "/invitations/me",
  authMiddleware,
  listMyInvitations
);


router.post(
  "/invitations/:id/accept",
  authMiddleware,
  acceptInvitation
);


router.post(
  "/invitations/:id/reject",
  authMiddleware,
  rejectInvitation
);

export default router;
