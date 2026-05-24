import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import os from 'os';
import authRoutes from './routes/auth.routes';
import productRoutes from './routes/product.routes';
import categoryRoutes from './routes/category.routes';
import orderRoutes from './routes/order.routes';
import customerRoutes from './routes/customer.routes';
import { errorMiddleware } from './middleware/error.middleware';


dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors({
  origin: true,
  credentials: true,
}));
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check route
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    message: 'POS Market API is running',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/customers', customerRoutes);


// Error handler (phải đặt cuối cùng)
app.use(errorMiddleware);


// Start server
app.listen(Number(PORT), '0.0.0.0', () => {
  // Get LAN IP dynamically
  const getLanIp = () => {
    const interfaces = os.networkInterfaces();
    for (const devName in interfaces) {
      const iface = interfaces[devName];
      if (iface) {
        for (const alias of iface) {
          if (alias.family === 'IPv4' && !alias.internal) {
            return alias.address;
          }
        }
      }
    }
    return 'localhost';
  };
  const LAN_IP = getLanIp();

  console.log(`🚀 Server running on:`);
  console.log(`   - Local: http://localhost:${PORT}`);
  console.log(`   - LAN:   http://${LAN_IP}:${PORT}`);
  console.log(`📋 Health check: http://${LAN_IP}:${PORT}/api/health`);
  console.log(`🔐 Auth API: http://${LAN_IP}:${PORT}/api/auth/login`);
});

export default app;

