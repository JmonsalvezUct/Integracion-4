import { Router } from 'express';
import { register, login, me, refresh, logout, recoverPassword} from './auth.controller.js';
import { authMiddleware, validateRecoverPassword } from '../../middlewares/auth.middleware.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refresh);
router.post('/logout', logout);

router.get('/me', authMiddleware, me);
router.post("/recover-password", validateRecoverPassword, recoverPassword);

export default router;
