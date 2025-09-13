import { Router } from 'express';
import { register, login, me, refresh, logout, recoverPassword, resetPassword} from './auth.controller.js';
import { authMiddleware, validateRecoverPassword, validateResetPassword} from '../../middlewares/auth.middleware.js';
import { authLimiter } from '../../middlewares/ratelimit.middleware.js';
const router = Router();

router.post('/register', register);
router.post('/login', authLimiter, login);
router.post('/refresh', refresh);
router.post('/logout', logout);

router.get('/me', authMiddleware, me);
router.post("/recover-password", authLimiter, validateRecoverPassword, recoverPassword);
router.post("/reset-password", authLimiter, validateResetPassword, resetPassword);

export default router;
