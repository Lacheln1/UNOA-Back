import express from 'express';
import { getUserBenefits } from '../controllers/userController.js';

const router = express.Router();

router.get('/benefits/:name', getUserBenefits);

export default router;
