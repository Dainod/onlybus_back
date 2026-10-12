import prisma from '../db/prisma.js';

// ==========================================
// LISTAR TODAS LAS RUTAS
// ==========================================
export const getRoutes = async (req, res) => {
  try {
    const routes = await prisma.routes.findMany({
      include: {
        _count: { select: { route_stops: true } }
      },
      orderBy: { id: 'asc' }
    });

    res.status(200).json({ routes });
  } catch (error) {
    console.error('Error al listar rutas:', error);
    res.status(500).json({ error: 'Error interno del servidor al listar rutas.' });
  }
};

// ==========================================
// CREAR RUTA
// ==========================================
export const createRoute = async (req, res) => {
  const { name, description } = req.body;

  try {
    if (!name) {
      return res.status(400).json({ error: 'El nombre de la ruta es obligatorio.' });
    }

    const route = await prisma.routes.create({
      data: { name, description }
    });

    res.status(201).json({ message: 'Ruta creada exitosamente.', route });
  } catch (error) {
    console.error('Error al crear ruta:', error);
    res.status(500).json({ error: 'Error interno del servidor al crear ruta.' });
  }
};

// ==========================================
// OBTENER RUTA POR ID (con sus paradas ordenadas)
// ==========================================
export const getRouteById = async (req, res) => {
  const { id } = req.params;

  try {
    const route = await prisma.routes.findUnique({
      where: { id: parseInt(id) },
      include: {
        route_stops: {
          include: { stops: true },
          orderBy: { stop_order: 'asc' }
        }
      }
    });

    if (!route) {
      return res.status(404).json({ error: 'Ruta no encontrada.' });
    }

    res.status(200).json({ route });
  } catch (error) {
    console.error('Error al obtener ruta:', error);
    res.status(500).json({ error: 'Error interno del servidor al obtener ruta.' });
  }
};

// ==========================================
// ACTUALIZAR RUTA
// ==========================================
export const updateRoute = async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;

  try {
    const exists = await prisma.routes.findUnique({ where: { id: parseInt(id) } });
    if (!exists) {
      return res.status(404).json({ error: 'Ruta no encontrada.' });
    }

    const route = await prisma.routes.update({
      where: { id: parseInt(id) },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description })
      }
    });

    res.status(200).json({ message: 'Ruta actualizada exitosamente.', route });
  } catch (error) {
    console.error('Error al actualizar ruta:', error);
    res.status(500).json({ error: 'Error interno del servidor al actualizar ruta.' });
  }
};

// ==========================================
// ELIMINAR RUTA
// ==========================================
export const deleteRoute = async (req, res) => {
  const { id } = req.params;

  try {
    const exists = await prisma.routes.findUnique({ where: { id: parseInt(id) } });
    if (!exists) {
      return res.status(404).json({ error: 'Ruta no encontrada.' });
    }

    await prisma.routes.delete({ where: { id: parseInt(id) } });

    res.status(200).json({ message: 'Ruta eliminada exitosamente.' });
  } catch (error) {
    console.error('Error al eliminar ruta:', error);
    res.status(500).json({ error: 'Error interno del servidor al eliminar ruta.' });
  }
};

// ==========================================
// AGREGAR PARADA A UNA RUTA (Tarea 1.3)
// ==========================================
export const addStopToRoute = async (req, res) => {
  const { id } = req.params;
  const { stop_id, stop_order } = req.body;

  try {
    if (!stop_id || stop_order === undefined) {
      return res.status(400).json({ error: 'stop_id y stop_order son obligatorios.' });
    }

    const route = await prisma.routes.findUnique({ where: { id: parseInt(id) } });
    if (!route) {
      return res.status(404).json({ error: 'Ruta no encontrada.' });
    }

    const stop = await prisma.stops.findUnique({ where: { id: parseInt(stop_id) } });
    if (!stop) {
      return res.status(404).json({ error: 'Parada no encontrada.' });
    }

    const routeStop = await prisma.route_stops.create({
      data: {
        route_id: parseInt(id),
        stop_id: parseInt(stop_id),
        stop_order: parseInt(stop_order)
      },
      include: { stops: true }
    });

    res.status(201).json({ message: 'Parada agregada a la ruta exitosamente.', routeStop });
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'La parada ya está asignada a esta ruta o el orden ya existe.' });
    }
    console.error('Error al agregar parada a ruta:', error);
    res.status(500).json({ error: 'Error interno del servidor al agregar parada.' });
  }
};
