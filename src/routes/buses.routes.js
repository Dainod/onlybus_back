import { Router } from 'express';
import { assignBusToRoute } from '../controllers/buses.controller.js';

const router = Router();

router.post('/assign', assignBusToRoute);

export default router;
