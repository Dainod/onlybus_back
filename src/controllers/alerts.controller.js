import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// POST /api/alerts — Crear alerta
export const createAlert = async (req, res) => {
  const { bus_id, stop_id, distance_threshold_m } = req.body;
  const user_id = req.user.id; // viene del token JWT

  if (!bus_id || !stop_id || distance_threshold_m === undefined) {
    return res.status(400).json({ error: 'Los campos bus_id, stop_id y distance_threshold_m son obligatorios.' });
  }

  if (typeof distance_threshold_m !== 'number' || distance_threshold_m <= 0) {
    return res.status(400).json({ error: 'distance_threshold_m debe ser un número positivo en metros.' });
  }

  try {
    // Verificar que el bus existe
    const bus = await prisma.buses.findUnique({ where: { id: bus_id } });
    if (!bus) {
      return res.status(404).json({ error: 'El bus no existe.' });
    }

    // Verificar que la parada existe
    const stop = await prisma.stops.findUnique({ where: { id: stop_id } });
    if (!stop) {
      return res.status(404).json({ error: 'La parada no existe.' });
    }

    const alert = await prisma.proximity_alerts.create({
      data: { user_id, bus_id, stop_id, distance_threshold_m, is_active: true },
      include: {
        buses: { select: { id: true, plate: true } },
        stops: { select: { id: true, name: true } }
      }
    });

    return res.status(201).json({
      ok: true,
      message: `Alerta creada: te avisamos cuando el bus esté a menos de ${distance_threshold_m}m de "${stop.name}".`,
      data: alert
    });
  } catch (error) {
    console.error('[createAlert]', error);
    return res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

// GET /api/alerts — Listar alertas
export const getAlerts = async (req, res) => {
  const user_id = req.user.id;

  try {
    const alerts = await prisma.proximity_alerts.findMany({
      where: { user_id },
      include: {
        buses: { select: { id: true, plate: true } },
        stops: { select: { id: true, name: true } }
      },
      orderBy: { created_at: 'desc' }
    });

    return res.status(200).json({ ok: true, total: alerts.length, data: alerts });
  } catch (error) {
    console.error('[getAlerts]', error);
    return res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

// DELETE /api/alerts/:id — Eliminar alerta
export const deleteAlert = async (req, res) => {
  const { id } = req.params;
  const user_id = req.user.id;

  try {
    const alert = await prisma.proximity_alerts.findUnique({ where: { id: parseInt(id) } });

    if (!alert) {
      return res.status(404).json({ error: 'Alerta no encontrada.' });
    }

    if (alert.user_id !== user_id) {
      return res.status(403).json({ error: 'No puedes eliminar esta alerta.' });
    }

    await prisma.proximity_alerts.delete({ where: { id: parseInt(id) } });
    return res.status(200).json({ ok: true, message: 'Alerta eliminada.' });
  } catch (error) {
    console.error('[deleteAlert]', error);
    return res.status(500).json({ error: 'Error interno del servidor.' });
  }
};