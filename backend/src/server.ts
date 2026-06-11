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
import aiRoutes from './routes/ai.routes';
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
app.use(helmet({ crossOriginResourcePolicy: false })); // Allow cross-origin images
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (uploads)
import path from 'path';
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

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
app.use('/api/ai', authMiddleware, aiRoutes);

// === WEBHOOK Routes (public — PayOS gọi từ bên ngoài) ===
app.use('/api/webhook', paymentRoutes);

// Error handler (phải đặt cuối cùng)
app.use(errorMiddleware);


// Start server
app.listen(Number(PORT), '0.0.0.0', () => {
  // Get LAN IP dynamically — ưu tiên Wi-Fi (192.168.x.x) trước VPN/VMware
  const getLanIp = () => {
    const interfaces = os.networkInterfaces();
    let fallbackIp = 'localhost';

    // Ưu tiên 1: Tìm adapter có tên Wi-Fi
    for (const devName in interfaces) {
      const iface = interfaces[devName];
      if (iface && devName.toLowerCase().includes('wi-fi')) {
        for (const alias of iface) {
          if (alias.family === 'IPv4' && !alias.internal) {
            return alias.address;
          }
        }
      }
    }

    // Ưu tiên 2: Tìm IP 192.168.x.x (mạng nội bộ phổ biến nhất)
    for (const devName in interfaces) {
      const iface = interfaces[devName];
      if (iface) {
        for (const alias of iface) {
          if (alias.family === 'IPv4' && !alias.internal) {
            if (alias.address.startsWith('192.168.')) {
              return alias.address;
            }
            if (fallbackIp === 'localhost') {
              fallbackIp = alias.address;
            }
          }
        }
      }
    }
    return fallbackIp;
  };
  const LAN_IP = getLanIp();

  console.log('');
  console.log('╔══════════════════════════════════════════════════╗');
  console.log('║           🚀 POS SYSTEM - ĐANG CHẠY            ║');
  console.log('╠══════════════════════════════════════════════════╣');
  console.log(`║  🖥️  Máy tính:  http://localhost:${PORT}          ║`);
  console.log(`║  📱 Điện thoại: http://${LAN_IP}:${PORT}     ║`);
  console.log('╠══════════════════════════════════════════════════╣');
  console.log(`║  🌐 Frontend:   http://${LAN_IP}:3000     ║`);
  console.log(`║  ⚙️  Backend:    http://${LAN_IP}:${PORT}     ║`);
  console.log('╚══════════════════════════════════════════════════╝');
  console.log('');
  console.log(`📱 Mở điện thoại → Trình duyệt → Gõ: http://${LAN_IP}:3000`);
  console.log('');
});

export default app;
