import { Router } from 'express';
import {
  getRoutes,
  createRoute,
  getRouteById,
  updateRoute,
  deleteRoute,
  addStopToRoute
} from '../controllers/routes.controller.js';

const router = Router();

router.get('/', getRoutes);
router.post('/', createRoute);
router.get('/:id', getRouteById);
router.put('/:id', updateRoute);
router.delete('/:id', deleteRoute);
router.post('/:id/stops', addStopToRoute);

export default router;
