import prisma from '../db/prisma.js';

// ==========================================
// ASIGNAR BUS A UNA RUTA (Tarea 1.4)
// ==========================================
export const assignBusToRoute = async (req, res) => {
  const { bus_id, route_id } = req.body;

  try {
    if (!bus_id || !route_id) {
      return res.status(400).json({ error: 'bus_id y route_id son obligatorios.' });
    }

    const bus = await prisma.buses.findUnique({ where: { id: parseInt(bus_id) } });
    if (!bus) {
      return res.status(404).json({ error: 'Bus no encontrado.' });
    }

    const route = await prisma.routes.findUnique({ where: { id: parseInt(route_id) } });
    if (!route) {
      return res.status(404).json({ error: 'Ruta no encontrada.' });
    }

    const assignment = await prisma.bus_routes.create({
      data: {
        bus_id: parseInt(bus_id),
        route_id: parseInt(route_id)
      },
      include: {
        buses: true,
        routes: true
      }
    });

    res.status(201).json({ message: 'Bus asignado a la ruta exitosamente.', assignment });
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'Este bus ya está asignado a esa ruta.' });
    }
    console.error('Error al asignar bus a ruta:', error);
    res.status(500).json({ error: 'Error interno del servidor al asignar bus.' });
  }
};
