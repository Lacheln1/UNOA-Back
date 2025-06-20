import express from 'express';
import {
  registerUser,
  checkUserIdDuplicate,
} from '../controllers/authController.js';

const router = express.Router();

router.post('/register', registerUser);
router.get('/check-id', checkUserIdDuplicate);

export default router;
