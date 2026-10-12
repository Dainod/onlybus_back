import { Router } from 'express';
import { addFavorite, getFavorites, removeFavorite } from '../controllers/favorites.controller.js';
import { checkAuth } from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/',      checkAuth, addFavorite);
router.get('/',       checkAuth, getFavorites);
router.delete('/:id', checkAuth, removeFavorite);

export default router;