import { Request, Response } from 'express';
import * as orderService from '../services/order.service';
import { generateInvoicePdf } from '../utils/pdf';
import { sendInvoiceEmail } from '../utils/email';
import prisma from '../config/prisma';


// POST /api/orders
export const create = async (req: Request, res: Response) => {
  try {
    // Lấy nhanVienId từ JWT token (đã được authMiddleware gắn vào req.user)
    const nhanVienId = req.user?.userId;
    if (!nhanVienId) {
      res.status(401).json({ error: 'Không xác định được nhân viên từ token' });
      return;
    }

    // Tìm ca làm việc đang mở của nhân viên
    const shift = await prisma.caLamViec.findFirst({
      where: { nhanVienId, status: 'OPEN' }
    });

    if (!shift) {
      res.status(400).json({ error: 'Bạn chưa mở ca làm việc. Vui lòng mở ca trước khi bán hàng.' });
      return;
    }

    const order = await orderService.createOrder({
      ...req.body,
      nhanVienId, // Ghi đè nhanVienId từ token — KHÔNG tin client
      caLamViecId: shift.id, // Tự động gán ca đang mở
    });
    res.status(201).json(order);
  } catch (err: any) {
    console.error('Error creating order:', err);
    res.status(400).json({ error: err.message || 'Lỗi tạo đơn hàng' });
  }
};

// GET /api/orders
export const getAll = async (req: Request, res: Response) => {
  try {
    const { status, nhanVienId, khachHangId, caLamViecId, page, limit } = req.query;
    const result = await orderService.findManyOrders({
      status: status as string,
      nhanVienId: nhanVienId ? Number(nhanVienId) : undefined,
      khachHangId: khachHangId ? Number(khachHangId) : undefined,
      caLamViecId: caLamViecId ? Number(caLamViecId) : undefined,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 20,
    });
    res.json(result);
  } catch (err: any) {
    console.error('Error fetching orders:', err);
    res.status(500).json({ error: 'Lỗi lấy danh sách đơn hàng' });
  }
};

// GET /api/orders/:id
export const getById = async (req: Request, res: Response) => {
  try {
    const order = await orderService.findOrderById(Number(req.params.id));
    if (!order) {
      res.status(404).json({ error: 'Không tìm thấy đơn hàng' });
      return;
    }
    res.json(order);
  } catch (err: any) {
    console.error('Error fetching order by ID:', err);
    res.status(500).json({ error: 'Lỗi server' });
  }
};

// PATCH /api/orders/:id/status
export const updateStatus = async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    if (!['PENDING', 'COMPLETED', 'CANCELLED'].includes(status)) {
      res.status(400).json({ error: 'Trạng thái đơn hàng không hợp lệ' });
      return;
    }
    const order = await orderService.updateOrderStatus(Number(req.params.id), status);
    res.json(order);
  } catch (err: any) {
    console.error('Error updating order status:', err);
    res.status(400).json({ error: err.message || 'Lỗi cập nhật trạng thái đơn hàng' });
  }
};

// POST /api/orders/:id/pay
export const pay = async (req: Request, res: Response) => {
  try {
    const result = await orderService.processPayment(Number(req.params.id), req.body);
    res.json(result);
  } catch (err: any) {
    console.error('Error processing payment:', err);
    res.status(400).json({ error: err.message || 'Lỗi xử lý thanh toán' });
  }
};

// GET /api/orders/:id/pdf
export const getPdf = async (req: Request, res: Response) => {
  try {
    const order = await orderService.findOrderById(Number(req.params.id));
    if (!order) {
      res.status(404).json({ error: 'Không tìm thấy đơn hàng' });
      return;
    }
    const pdfBuffer = await generateInvoicePdf(order);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice-${order.id}.pdf`);
    res.send(pdfBuffer);
  } catch (err: any) {
    console.error('Error generating PDF:', err);
    res.status(500).json({ error: 'Lỗi xuất hóa đơn PDF' });
  }
};

// POST /api/orders/:id/email
export const sendEmail = async (req: Request, res: Response) => {
  try {
    const order = await orderService.findOrderById(Number(req.params.id));
    if (!order) {
      res.status(404).json({ error: 'Không tìm thấy đơn hàng' });
      return;
    }

    const toEmail = req.body.email || order.khachHang?.email;
    if (!toEmail) {
      res.status(400).json({ error: 'Không tìm thấy địa chỉ email nhận. Vui lòng nhập địa chỉ email.' });
      return;
    }

    const pdfBuffer = await generateInvoicePdf(order);
    const emailResult = await sendInvoiceEmail(toEmail, order, pdfBuffer);
    
    res.json({ 
      message: 'Đã gửi email hóa đơn thành công', 
      previewUrl: emailResult.previewUrl 
    });
  } catch (err: any) {
    console.error('Error sending email:', err);
    res.status(500).json({ error: err.message || 'Lỗi gửi email hóa đơn' });
  }
};

// GET /api/orders/active-shift
export const getActiveShift = async (req: Request, res: Response) => {
  try {
    let shift = await prisma.caLamViec.findFirst({
      where: { status: 'OPEN' },
    });

    if (!shift) {
      // Tìm cashier đầu tiên hoặc mặc định ID 2
      const employee = await prisma.nhanVien.findFirst({
        where: { role: { name: 'Cashier' } },
      });
      const employeeId = employee ? employee.id : 2;

      shift = await prisma.caLamViec.create({
        data: {
          nhanVienId: employeeId,
          openingBalance: 1000000,
          status: 'OPEN',
        },
      });
      console.log(`[Auto] Đã tự động mở ca làm việc ID ${shift.id} cho nhân viên ID ${employeeId}`);
    }

    res.json(shift);
  } catch (err: any) {
    console.error('Error fetching/creating active shift:', err);
    res.status(500).json({ error: 'Lỗi lấy ca làm việc hoạt động' });
  }
};


