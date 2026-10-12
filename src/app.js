import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import authRoutes from './routes/auth.routes.js';
import routeRoutes from './routes/routes.routes.js';
import stopRoutes from './routes/stops.routes.js';
import busRoutes from './routes/buses.routes.js';
import favoritesRoutes from './routes/favorites.routes.js';
import alertsRoutes from './routes/alerts.routes.js';
import trackingRoutes from './routes/tracking.routes.js';
import { startCleanupJob } from './controllers/tracking.controller.js';

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Rutas base de la API
app.use('/api/auth', authRoutes);
app.use('/api/favorites', favoritesRoutes);
app.use('/api/routes', routeRoutes);
app.use('/api/stops', stopRoutes);
app.use('/api/buses', busRoutes);
app.use('/api/alerts', alertsRoutes);
app.use('/api/tracking', trackingRoutes);

// Job de limpieza automática de GPS
startCleanupJob();

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ message: 'API de OnlyBus funcionando correctamente.' });
});

export default app;