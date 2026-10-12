import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// POST /api/favorites — Agregar favorito
export const addFavorite = async (req, res) => {
  const { route_id } = req.body;
  const user_id = req.user.id; // viene del token JWT

  if (!route_id) {
    return res.status(400).json({ error: 'El campo route_id es obligatorio.' });
  }

  try {
    const route = await prisma.routes.findUnique({ where: { id: route_id } });
    if (!route) {
      return res.status(404).json({ error: 'La ruta no existe.' });
    }

    const existing = await prisma.favorites.findFirst({ where: { user_id, route_id } });
    if (existing) {
      return res.status(409).json({ error: 'Esta ruta ya está en tus favoritos.' });
    }

    const favorite = await prisma.favorites.create({
      data: { user_id, route_id },
      include: { routes: { select: { id: true, name: true } } }
    });

    return res.status(201).json({ ok: true, message: 'Ruta agregada a favoritos.', data: favorite });
  } catch (error) {
    console.error('[addFavorite]', error);
    return res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

// GET /api/favorites — Listar favoritos
export const getFavorites = async (req, res) => {
  const user_id = req.user.id;

  try {
    const favorites = await prisma.favorites.findMany({
      where: { user_id },
      include: { routes: { select: { id: true, name: true } } },
      orderBy: { created_at: 'desc' }
    });

    return res.status(200).json({ ok: true, total: favorites.length, data: favorites });
  } catch (error) {
    console.error('[getFavorites]', error);
    return res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

// DELETE /api/favorites/:id — Eliminar favorito
export const removeFavorite = async (req, res) => {
  const { id } = req.params;
  const user_id = req.user.id;

  try {
    const favorite = await prisma.favorites.findUnique({ where: { id: parseInt(id) } });

    if (!favorite) {
      return res.status(404).json({ error: 'Favorito no encontrado.' });
    }

    if (favorite.user_id !== user_id) {
      return res.status(403).json({ error: 'No puedes eliminar este favorito.' });
    }

    await prisma.favorites.delete({ where: { id: parseInt(id) } });
    return res.status(200).json({ ok: true, message: 'Favorito eliminado.' });
  } catch (error) {
    console.error('[removeFavorite]', error);
    return res.status(500).json({ error: 'Error interno del servidor.' });
  }
};