import express from 'express';
import {
  registerUser,
  checkUserIdDuplicate,
  loginUser,
} from '../controllers/authController.js';

const router = express.Router();

router.post('/register', registerUser);
router.get('/check-id', checkUserIdDuplicate);
router.post('/login', loginUser);

export default router;
