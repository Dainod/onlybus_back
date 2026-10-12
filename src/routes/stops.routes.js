import { Router } from 'express';
import {
  getStops,
  createStop,
  getStopById,
  updateStop,
  deleteStop
} from '../controllers/stops.controller.js';

const router = Router();

router.get('/', getStops);
router.post('/', createStop);
router.get('/:id', getStopById);
router.put('/:id', updateStop);
router.delete('/:id', deleteStop);

export default router;
