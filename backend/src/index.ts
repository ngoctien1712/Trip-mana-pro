import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import adminRoutes from './routes/admin.routes.js';
import adminGeographyRoutes from './routes/admin-geography.routes.js';
import geographyRoutes from './routes/geography.routes.js';
import ownerRoutes from './routes/owner.routes.js';
import customerRoutes from './routes/customer.routes.js';
import chatRoutes from './routes/chat.routes.js';
import planningRoutes from './routes/planning.routes.js';
import notificationRoutes from './routes/notification.routes.js';
import { startOrderMonitor } from './services/order-monitor.service.js';
import { startPaymentWorker } from './workers/payment.worker.js';
import { startEmailWorker } from './workers/email.worker.js';
import { startAuthWorker } from './workers/auth.worker.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Start workers
startPaymentWorker();
startEmailWorker();
startAuthWorker();

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:8080', credentials: true }));
app.use(express.json());
app.use((req, res, next) => {
  next();
});
app.use('/uploads', express.static('uploads'));

app.use('/api/chat', chatRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin/geography', adminGeographyRoutes);
app.use('/api/geography', geographyRoutes);
app.use('/api/owner', ownerRoutes);
app.use('/api/customer', customerRoutes);
app.use('/api/planning', planningRoutes);
app.use('/api/notifications', notificationRoutes);

app.get('/api/health', (_, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

app.listen(PORT, () => {
});
