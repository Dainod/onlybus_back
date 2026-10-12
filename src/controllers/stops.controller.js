import prisma from '../db/prisma.js';

// ==========================================
// LISTAR TODAS LAS PARADAS
// ==========================================
export const getStops = async (req, res) => {
  try {
    const stops = await prisma.stops.findMany({
      orderBy: { id: 'asc' }
    });

    res.status(200).json({ stops });
  } catch (error) {
    console.error('Error al listar paradas:', error);
    res.status(500).json({ error: 'Error interno del servidor al listar paradas.' });
  }
};

// ==========================================
// CREAR PARADA
// ==========================================
export const createStop = async (req, res) => {
  const { name, latitude, longitude } = req.body;

  try {
    if (!name || latitude === undefined || longitude === undefined) {
      return res.status(400).json({ error: 'Nombre, latitud y longitud son obligatorios.' });
    }

    const stop = await prisma.stops.create({
      data: {
        name,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude)
      }
    });

    res.status(201).json({ message: 'Parada creada exitosamente.', stop });
  } catch (error) {
    console.error('Error al crear parada:', error);
    res.status(500).json({ error: 'Error interno del servidor al crear parada.' });
  }
};

// ==========================================
// OBTENER PARADA POR ID
// ==========================================
export const getStopById = async (req, res) => {
  const { id } = req.params;

  try {
    const stop = await prisma.stops.findUnique({
      where: { id: parseInt(id) }
    });

    if (!stop) {
      return res.status(404).json({ error: 'Parada no encontrada.' });
    }

    res.status(200).json({ stop });
  } catch (error) {
    console.error('Error al obtener parada:', error);
    res.status(500).json({ error: 'Error interno del servidor al obtener parada.' });
  }
};

// ==========================================
// ACTUALIZAR PARADA
// ==========================================
export const updateStop = async (req, res) => {
  const { id } = req.params;
  const { name, latitude, longitude } = req.body;

  try {
    const exists = await prisma.stops.findUnique({ where: { id: parseInt(id) } });
    if (!exists) {
      return res.status(404).json({ error: 'Parada no encontrada.' });
    }

    const stop = await prisma.stops.update({
      where: { id: parseInt(id) },
      data: {
        ...(name && { name }),
        ...(latitude !== undefined && { latitude: parseFloat(latitude) }),
        ...(longitude !== undefined && { longitude: parseFloat(longitude) })
      }
    });

    res.status(200).json({ message: 'Parada actualizada exitosamente.', stop });
  } catch (error) {
    console.error('Error al actualizar parada:', error);
    res.status(500).json({ error: 'Error interno del servidor al actualizar parada.' });
  }
};

// ==========================================
// ELIMINAR PARADA
// ==========================================
export const deleteStop = async (req, res) => {
  const { id } = req.params;

  try {
    const exists = await prisma.stops.findUnique({ where: { id: parseInt(id) } });
    if (!exists) {
      return res.status(404).json({ error: 'Parada no encontrada.' });
    }

    await prisma.stops.delete({ where: { id: parseInt(id) } });

    res.status(200).json({ message: 'Parada eliminada exitosamente.' });
  } catch (error) {
    console.error('Error al eliminar parada:', error);
    res.status(500).json({ error: 'Error interno del servidor al eliminar parada.' });
  }
};
