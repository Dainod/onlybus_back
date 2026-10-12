import { PrismaClient } from '@prisma/client';
import cron from 'node-cron';

const prisma = new PrismaClient();

// POST /api/tracking
// Recibe datos del rastreador GPS y actualiza la posición del bus
export const receiveTracking = async (req, res) => {
  const { device_code, latitude, longitude, speed, heading } = req.body;

  if (!device_code || !latitude || !longitude) {
    return res.status(400).json({ error: 'device_code, latitude y longitude son obligatorios.' });
  }

  try {
    // 1. Buscar el dispositivo por su device_code (IMEI)
    const device = await prisma.gps_devices.findFirst({
      where: { device_code, is_active: true }
    });

    if (!device) {
      return res.status(404).json({ error: 'Dispositivo GPS no encontrado o inactivo.' });
    }

    // 2. Insertar en el historial de tracking
    await prisma.gps_tracking.create({
      data: {
        device_id: device.id,
        latitude,
        longitude,
        speed: speed || 0,
        recorded_at: new Date()
      }
    });

    // 3. Actualizar la ubicación actual del bus
    await prisma.bus_current_location.upsert({
      where: { bus_id: device.bus_id },
      update: {
        latitude,
        longitude,
        speed: speed || 0,
        heading: heading || 0,
        updated_at: new Date()
      },
      create: {
        bus_id: device.bus_id,
        latitude,
        longitude,
        speed: speed || 0,
        heading: heading || 0,
        updated_at: new Date()
      }
    });

    return res.status(200).json({ ok: true, message: 'Ubicación actualizada correctamente.' });
  } catch (error) {
    console.error('[receiveTracking]', error);
    return res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

// GET /api/tracking/bus/:bus_id
// Retorna la ubicación actual de un bus en vivo
export const getBusLocation = async (req, res) => {
  const { bus_id } = req.params;

  try {
    const location = await prisma.bus_current_location.findUnique({
      where: { bus_id: parseInt(bus_id) },
      include: {
        buses: { select: { id: true, plate: true } }
      }
    });

    if (!location) {
      return res.status(404).json({ error: 'No se encontró ubicación para este bus.' });
    }

    return res.status(200).json({ ok: true, data: location });
  } catch (error) {
    console.error('[getBusLocation]', error);
    return res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

// Job de limpieza — elimina registros de gps_tracking con más de 7 días
// Se ejecuta automáticamente todos los días a las 2:00 AM
export const startCleanupJob = () => {
  cron.schedule('0 2 * * *', async () => {
    try {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const deleted = await prisma.gps_tracking.deleteMany({
        where: { recorded_at: { lt: sevenDaysAgo } }
      });

      console.log(`[CleanupJob] ${deleted.count} registros GPS eliminados.`);
    } catch (error) {
      console.error('[CleanupJob] Error al limpiar registros:', error);
    }
  });

  console.log('[CleanupJob] Job de limpieza GPS iniciado — se ejecuta cada día a las 2:00 AM.');
};