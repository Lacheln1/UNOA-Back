import express from 'express';

import {
  getPlans,
  comparePlansByAI,
  getConversationByIp,
  getConversationById,
  getAdminStats,
  checkHealth,
} from '../controllers/chatbotController.js';

const router = express.Router();

// [Health Check]
router.get('/health', checkHealth);

// [Plans]
router.get('/plans', getPlans);

// [Conversations]
router.get('/conversations/ip/:ip', getConversationByIp);
router.get('/conversations/:sessionId', getConversationById);

// [Admin]
router.get('/admin/stats', getAdminStats);

//비교요약 
router.post('/plans/compare', comparePlansByAI);

export default router;
