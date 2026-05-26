import prisma from '../config/prisma';
import { CreateOrderInput } from '../validators/order.validator';
import { createInvoice } from './invoice.service';


// Tạo đơn hàng mới với Prisma transaction (đảm bảo tính toàn vẹn dữ liệu)
export const createOrder = async (data: CreateOrderInput) => {
  const { nhanVienId, caLamViecId, khachHangId, items, discount = 0, taxRate = 0 } = data;

  return prisma.$transaction(async (tx) => {
    // 1. Kiểm tra nhân viên tồn tại
    const employee = await tx.nhanVien.findUnique({
      where: { id: nhanVienId },
    });
    if (!employee) {
      throw new Error(`Nhân viên với ID ${nhanVienId} không tồn tại`);
    }

    // 2. Kiểm tra ca làm việc tồn tại và đang mở
    const shift = await tx.caLamViec.findUnique({
      where: { id: caLamViecId },
    });
    if (!shift) {
      throw new Error(`Ca làm việc với ID ${caLamViecId} không tồn tại`);
    }
    if (shift.status !== 'OPEN') {
      throw new Error('Ca làm việc này đã đóng, không thể tạo đơn hàng');
    }

    // 3. Kiểm tra khách hàng (nếu có truyền)
    if (khachHangId) {
      const customer = await tx.khachHang.findUnique({
        where: { id: khachHangId },
      });
      if (!customer) {
        throw new Error(`Khách hàng với ID ${khachHangId} không tồn tại`);
      }
    }

    // 4. Kiểm tra danh sách sản phẩm và lượng tồn kho
    const productIds = items.map((i: any) => i.sanPhamId);
    const dbProducts = await tx.sanPham.findMany({
      where: { id: { in: productIds } },
    });

    if (dbProducts.length !== productIds.length) {
      throw new Error('Một số sản phẩm trong đơn hàng không tồn tại');
    }

    let subTotal = 0;

    // Tạo cấu trúc lưu thông tin chi tiết các mặt hàng để insert
    const orderItemsToCreate: any[] = [];

    for (const item of items) {
      const product = dbProducts.find((p) => p.id === item.sanPhamId)!;

      // Kiểm tra số lượng tồn kho
      if (product.stock < item.quantity) {
        throw new Error(
          `Sản phẩm "${product.name}" không đủ hàng tồn kho (Yêu cầu: ${item.quantity}, Hiện có: ${product.stock})`
        );
      }

      // Giảm tồn kho sản phẩm
      await tx.sanPham.update({
        where: { id: product.id },
        data: {
          stock: {
            decrement: item.quantity,
          },
        },
      });

      // Tính tổng tiền cho sản phẩm này
      const itemPrice = product.price;
      subTotal += itemPrice * item.quantity;

      orderItemsToCreate.push({
        sanPhamId: item.sanPhamId,
        quantity: item.quantity,
        price: itemPrice,
      });
    }

    // 5. Tính toán chiết khấu và thuế VAT (Tối ưu tính toán DB)
    const afterDiscount = Math.max(0, subTotal - discount);
    const taxAmount = afterDiscount * taxRate;
    const finalTotal = afterDiscount + taxAmount;

    // 6. Tạo đơn hàng mới
    const order = await tx.donHang.create({
      data: {
        nhanVienId: nhanVienId!,
        caLamViecId,
        khachHangId,
        total: finalTotal,
        status: 'PENDING', // Mặc định là PENDING chờ thanh toán
        chiTiets: {
          create: orderItemsToCreate,
        },
      },
      include: {
        chiTiets: {
          include: {
            sanPham: true,
          },
        },
        nhanVien: true,
        khachHang: true,
      },
    });

    return order;
  });
};

// Lấy danh sách đơn hàng có bộ lọc, phân trang
export const findManyOrders = async (query: {
  status?: string;
  nhanVienId?: number;
  khachHangId?: number;
  caLamViecId?: number;
  page?: number;
  limit?: number;
}) => {
  const { status, nhanVienId, khachHangId, caLamViecId, page = 1, limit = 20 } = query;
  const where: any = {};

  if (status) where.status = status;
  if (nhanVienId) where.nhanVienId = nhanVienId;
  if (khachHangId) where.khachHangId = khachHangId;
  if (caLamViecId) where.caLamViecId = caLamViecId;

  const [orders, total] = await Promise.all([
    prisma.donHang.findMany({
      where,
      include: {
        nhanVien: { select: { fullName: true, username: true } },
        khachHang: { select: { name: true, phone: true } },
        _count: { select: { chiTiets: true } },
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.donHang.count({ where }),
  ]);

  return {
    data: orders,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

// Lấy chi tiết một đơn hàng theo ID
export const findOrderById = (id: number) =>
  prisma.donHang.findUnique({
    where: { id },
    include: {
      nhanVien: { select: { id: true, fullName: true, username: true } },
      khachHang: true,
      caLamViec: true,
      chiTiets: {
        include: {
          sanPham: true,
        },
      },
      giaoDichs: {
        include: {
          pttt: true,
        },
      },
      hoaDon: true,
    },
  });

// Cập nhật trạng thái đơn hàng (PENDING, COMPLETED, CANCELLED)
export const updateOrderStatus = async (id: number, status: string) => {
  // Nếu hủy đơn hàng, cần hoàn lại số lượng tồn kho sản phẩm
  if (status === 'CANCELLED') {
    return prisma.$transaction(async (tx) => {
      const order = await tx.donHang.findUnique({
        where: { id },
        include: { chiTiets: true },
      });

      if (!order) throw new Error('Không tìm thấy đơn hàng');
      if (order.status === 'CANCELLED') throw new Error('Đơn hàng đã được hủy trước đó');

      // Hoàn trả tồn kho cho mỗi sản phẩm
      for (const item of order.chiTiets) {
        await tx.sanPham.update({
          where: { id: item.sanPhamId },
          data: {
            stock: {
              increment: item.quantity,
            },
          },
        });
      }

      return tx.donHang.update({
        where: { id },
        data: { status },
        include: { chiTiets: true },
      });
    });
  }

  return prisma.donHang.update({
    where: { id },
    data: { status },
    include: { chiTiets: true },
  });
};

// Xử lý thanh toán đơn hàng (Giao dịch & Hóa đơn)
export const processPayment = async (orderId: number, data: { ptttId: number; amount: number }) => {
  const { ptttId, amount } = data;

  return prisma.$transaction(async (tx) => {
    // 1. Kiểm tra đơn hàng tồn tại và đang PENDING
    const order = await tx.donHang.findUnique({
      where: { id: orderId },
      include: {
        caLamViec: true,
      },
    });

    if (!order) {
      throw new Error('Đơn hàng không tồn tại');
    }
    if (order.status !== 'PENDING') {
      throw new Error(`Đơn hàng đã ở trạng thái ${order.status}, không thể thanh toán`);
    }

    // 2. Kiểm tra ca làm việc của đơn hàng đang mở
    if (order.caLamViec.status !== 'OPEN') {
      throw new Error('Ca làm việc của đơn hàng này đã đóng, không thể thanh toán');
    }

    // 3. Kiểm tra phương thức thanh toán tồn tại
    const paymentMethod = await tx.phuongThucThanhToan.findUnique({
      where: { id: ptttId },
    });
    if (!paymentMethod) {
      throw new Error('Phương thức thanh toán không hợp lệ');
    }

    const grandTotal = Math.round(order.total * 1.1);
    // 4. Kiểm tra số tiền khách trả có đủ không
    if (amount < grandTotal) {
      throw new Error(
        `Số tiền thanh toán không đủ (Yêu cầu: ${grandTotal} ₫, Khách trả: ${amount} ₫)`
      );
    }

    // 5. Tạo giao dịch thanh toán thành công
    const transaction = await tx.giaoDich.create({
      data: {
        donHangId: order.id,
        ptttId,
        amount,
        status: 'SUCCESS',
      },
    });

    // 6. Tự động xuất hóa đơn
    const invoice = await createInvoice(order.id, tx);

    // 7. Cập nhật trạng thái đơn hàng thành COMPLETED
    const updatedOrder = await tx.donHang.update({
      where: { id: order.id },
      data: { status: 'COMPLETED' },
      include: {
        chiTiets: {
          include: {
            sanPham: true,
          },
        },
        nhanVien: true,
        khachHang: true,
        giaoDichs: {
          include: {
            pttt: true,
          },
        },
        hoaDon: true,
      },
    });

    return {
      order: updatedOrder,
      transaction,
      invoice,
      change: amount - (order.total * 1.1), // Tiền thừa trả khách (bao gồm cả VAT)
    };
  });
};
