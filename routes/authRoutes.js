import express from 'express';
import {
  registerUser,
  checkUserIdDuplicate,
  loginUser,
  getMe,
} from '../controllers/authController.js';

import { verifyToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.get('/check-id', checkUserIdDuplicate);
router.post('/login', loginUser);
router.get('/me', verifyToken, getMe);

export default router;
