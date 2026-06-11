import { describe, test, expect, jest, beforeEach } from '@jest/globals';
import * as orderService from '../src/services/order.service';
import prisma from '../src/config/prisma';

// Mock the prisma client
jest.mock('../src/config/prisma', () => ({
  __esModule: true,
  default: {
    $transaction: jest.fn() as any,
    donHang: {
      findUnique: jest.fn() as any,
      findMany: jest.fn() as any,
      count: jest.fn() as any,
      update: jest.fn() as any,
    },
    giaoDich: {
      create: jest.fn() as any,
      findMany: jest.fn() as any,
      count: jest.fn() as any,
    },
    hoaDon: {
      create: jest.fn() as any,
      count: jest.fn() as any,
    },
    nhanVien: {
      findUnique: jest.fn() as any,
    },
    caLamViec: {
      findUnique: jest.fn() as any,
    },
    khachHang: {
      findUnique: jest.fn() as any,
    },
    sanPham: {
      findMany: jest.fn() as any,
      update: jest.fn() as any,
    },
    phuongThucThanhToan: {
      findUnique: jest.fn() as any,
    },
  },
}));

describe('Unit Tests - Order & Payment API Core Logic', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // --- Test Case 1: Order Creation Success ---
  test('1. Should create order successfully with correct total and stock update inside transaction', async () => {
    const mockOrderInput = {
      nhanVienId: 1,
      caLamViecId: 1,
      khachHangId: 1,
      discount: 0,
      taxRate: 0,
      items: [{ sanPhamId: 1, quantity: 2 }],
    };

    const mockEmployee = { id: 1, fullName: 'Quản Trị Viên' };
    const mockShift = { id: 1, status: 'OPEN' };
    const mockCustomer = { id: 1, name: 'Nguyễn Văn An' };
    const mockProducts = [{ id: 1, name: 'Mì Hảo Hảo', price: 4500, stock: 10 }];

    const mockCreatedOrder = {
      id: 1,
      nhanVienId: 1,
      caLamViecId: 1,
      khachHangId: 1,
      total: 9000,
      status: 'PENDING',
    };

    // Mock the transaction callbacks
    const mockTx: any = {
      nhanVien: { findUnique: (jest.fn() as any).mockResolvedValue(mockEmployee) },
      caLamViec: { findUnique: (jest.fn() as any).mockResolvedValue(mockShift) },
      khachHang: { findUnique: (jest.fn() as any).mockResolvedValue(mockCustomer) },
      sanPham: {
        findMany: (jest.fn() as any).mockResolvedValue(mockProducts),
        update: (jest.fn() as any).mockResolvedValue(null),
      },
      donHang: {
        create: (jest.fn() as any).mockResolvedValue(mockCreatedOrder),
      },
    };

    (prisma.$transaction as any).mockImplementation(async (callback: any) => {
      return callback(mockTx);
    });

    const result = await orderService.createOrder(mockOrderInput);

    expect(prisma.$transaction).toHaveBeenCalled();
    expect(mockTx.nhanVien.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
    expect(mockTx.caLamViec.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
    expect(mockTx.sanPham.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { stock: { decrement: 2 } },
    });
    expect(result.total).toBe(9000);
    expect(result.status).toBe('PENDING');
  });

  // --- Test Case 2: Order Creation Stock Failure ---
  test('2. Should fail to create order if a product has insufficient stock', async () => {
    const mockOrderInput = {
      nhanVienId: 1,
      caLamViecId: 1,
      khachHangId: 1,
      discount: 0,
      taxRate: 0,
      items: [{ sanPhamId: 1, quantity: 20 }], // Asking for 20, but stock is 10
    };

    const mockEmployee = { id: 1, fullName: 'Quản Trị Viên' };
    const mockShift = { id: 1, status: 'OPEN' };
    const mockCustomer = { id: 1, name: 'Nguyễn Văn An' };
    const mockProducts = [{ id: 1, name: 'Mì Hảo Hảo', price: 4500, stock: 10 }];

    const mockTx: any = {
      nhanVien: { findUnique: (jest.fn() as any).mockResolvedValue(mockEmployee) },
      caLamViec: { findUnique: (jest.fn() as any).mockResolvedValue(mockShift) },
      khachHang: { findUnique: (jest.fn() as any).mockResolvedValue(mockCustomer) },
      sanPham: { findMany: (jest.fn() as any).mockResolvedValue(mockProducts) },
    };

    (prisma.$transaction as any).mockImplementation(async (callback: any) => {
      return callback(mockTx);
    });

    await expect(orderService.createOrder(mockOrderInput)).rejects.toThrow(
      'Sản phẩm "Mì Hảo Hảo" không đủ hàng tồn kho (Yêu cầu: 20, Hiện có: 10)'
    );
  });

  // --- Test Case 3: Order Creation Shift Closed Failure ---
  test('3. Should fail to create order if the cashier shift is closed', async () => {
    const mockOrderInput = {
      nhanVienId: 1,
      caLamViecId: 1,
      discount: 0,
      taxRate: 0,
      items: [{ sanPhamId: 1, quantity: 2 }],
    };

    const mockEmployee = { id: 1 };
    const mockShift = { id: 1, status: 'CLOSED' }; // Shift closed!

    const mockTx: any = {
      nhanVien: { findUnique: (jest.fn() as any).mockResolvedValue(mockEmployee) },
      caLamViec: { findUnique: (jest.fn() as any).mockResolvedValue(mockShift) },
    };

    (prisma.$transaction as any).mockImplementation(async (callback: any) => {
      return callback(mockTx);
    });

    await expect(orderService.createOrder(mockOrderInput)).rejects.toThrow(
      'Ca làm việc này đã đóng, không thể tạo đơn hàng'
    );
  });

  // --- Test Case 4: Process Payment Success ---
  test('4. Should process payment successfully and auto-generate invoice', async () => {
    const mockOrder = {
      id: 1,
      total: 9000,
      status: 'PENDING',
      caLamViec: { status: 'OPEN' },
    };
    const mockPttt = { id: 1, name: 'CASH' };
    const mockCreatedTxn = { id: 1, amount: 10000, status: 'SUCCESS' };
    const mockCreatedInvoice = { id: 1, invoiceNumber: 'HD-20260521-0001' };

    const mockTx: any = {
      donHang: {
        findUnique: (jest.fn() as any).mockResolvedValue(mockOrder),
        update: (jest.fn() as any).mockResolvedValue({
          id: 1,
          status: 'COMPLETED',
          total: 9000,
        }),
      },
      phuongThucThanhToan: { findUnique: (jest.fn() as any).mockResolvedValue(mockPttt) },
      giaoDich: { create: (jest.fn() as any).mockResolvedValue(mockCreatedTxn) },
      hoaDon: {
        create: (jest.fn() as any).mockResolvedValue(mockCreatedInvoice),
        count: (jest.fn() as any).mockResolvedValue(0),
      },
    };

    (prisma.$transaction as any).mockImplementation(async (callback: any) => {
      return callback(mockTx);
    });

    const result = await orderService.processPayment(1, { ptttId: 1, amount: 10000 });

    expect(result.change).toBe(100); // 10000 paid - 9900 total (incl. VAT) = 100 change
    expect(result.order.status).toBe('COMPLETED');
    expect(result.invoice.invoiceNumber).toBe('HD-20260521-0001');
  });

  // --- Test Case 5: Process Payment Insufficient Amount Failure ---
  test('5. Should fail to process payment if the paid amount is less than total', async () => {
    const mockOrder = {
      id: 1,
      total: 9000,
      status: 'PENDING',
      caLamViec: { status: 'OPEN' },
    };
    const mockPttt = { id: 1, name: 'CASH' };

    const mockTx: any = {
      donHang: { findUnique: (jest.fn() as any).mockResolvedValue(mockOrder) },
      phuongThucThanhToan: { findUnique: (jest.fn() as any).mockResolvedValue(mockPttt) },
    };

    (prisma.$transaction as any).mockImplementation(async (callback: any) => {
      return callback(mockTx);
    });

    await expect(
      orderService.processPayment(1, { ptttId: 1, amount: 5000 }) // Paying 5000 for 9000 total
    ).rejects.toThrow('Số tiền thanh toán không đủ (Yêu cầu: 9900 ₫, Khách trả: 5000 ₫)');
  });
});
