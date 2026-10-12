import { Router } from 'express';
import { createAlert, getAlerts, deleteAlert } from '../controllers/alerts.controller.js';
import { checkAuth } from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/',      checkAuth, createAlert);
router.get('/',       checkAuth, getAlerts);
router.delete('/:id', checkAuth, deleteAlert);

export default router;