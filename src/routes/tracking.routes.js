import { Router } from 'express';
import { receiveTracking, getBusLocation } from '../controllers/tracking.controller.js';

const router = Router();

// Recibe datos del rastreador GPS
router.post('/', receiveTracking);

// Retorna ubicación actual de un bus
router.get('/bus/:bus_id', getBusLocation);

export default router;