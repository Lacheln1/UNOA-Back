import express from 'express';
import {
  kakaoLogin,
  kakaoCallback,
  completeKakaoSignup,
} from '../controllers/kakaoAuthController.js';

const router = express.Router();

router.get('/login', kakaoLogin);
router.get('/callback', kakaoCallback);
router.post('/complete', completeKakaoSignup);

export default router;
