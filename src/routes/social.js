import { Router } from 'express';
import { fetchSocialMetrics } from '../services/socialService.js';

const router = Router();

// GET /social/:platform/:handle — fetch mock social metrics
router.get('/:platform/:handle', (req, res) => {
  const { platform, handle } = req.params;
  const metrics = fetchSocialMetrics(platform, handle);
  res.json(metrics);
});

export default router;
