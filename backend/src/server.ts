import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import os from 'os';
import authRoutes from './routes/auth.routes';
import productRoutes from './routes/product.routes';
import categoryRoutes from './routes/category.routes';
import orderRoutes from './routes/order.routes';
import transactionRoutes from './routes/transaction.routes';
import customerRoutes from './routes/customer.routes';
import employeeRoutes from './routes/employee.routes';
import paymentRoutes from './routes/payment.routes';
import reportRoutes from './routes/report.routes';
import shiftRoutes from './routes/shift.routes';
import { authMiddleware } from './middleware/auth.middleware';
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

// Health check route (public)
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    message: 'POS Market API is running',
    timestamp: new Date().toISOString(),
  });
});

// === PUBLIC Routes (không cần token) ===
app.use('/api/auth', authRoutes);

// === PROTECTED Routes (cần JWT token) ===
app.use('/api/products', authMiddleware, productRoutes);
app.use('/api/categories', authMiddleware, categoryRoutes);
app.use('/api/orders', authMiddleware, orderRoutes);
app.use('/api/transactions', authMiddleware, transactionRoutes);
app.use('/api/customers', authMiddleware, customerRoutes);
app.use('/api/employees', authMiddleware, employeeRoutes);
app.use('/api/payments', authMiddleware, paymentRoutes);
app.use('/api/reports', authMiddleware, reportRoutes);
app.use('/api/shifts', authMiddleware, shiftRoutes);

// === WEBHOOK Routes (public — PayOS gọi từ bên ngoài) ===
app.use('/api/webhook', paymentRoutes);

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
