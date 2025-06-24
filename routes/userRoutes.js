import express from 'express';
import { getUserBenefits } from '../controllers/userController.js';

const router = express.Router();

router.get('/benefits/:id', getUserBenefits);

export default router;
