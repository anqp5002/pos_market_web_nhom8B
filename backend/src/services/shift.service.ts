import prisma from '../config/prisma';

/**
 * Mở ca làm việc mới (FR-04)
 * - Kiểm tra nhân viên chưa có ca nào đang OPEN
 * - Tạo ca mới với số dư đầu ca
 */
export const openShift = async (nhanVienId: number, openingBalance: number) => {
  // Kiểm tra nhân viên tồn tại
  const employee = await prisma.nhanVien.findUnique({
    where: { id: nhanVienId },
    include: { role: true },
  });
  if (!employee) {
    throw new Error('Nhân viên không tồn tại');
  }

  // Kiểm tra không có ca nào đang OPEN
  const existingShift = await prisma.caLamViec.findFirst({
    where: { nhanVienId, status: 'OPEN' },
  });
  if (existingShift) {
    throw new Error('Bạn đang có ca làm việc đang mở. Vui lòng đóng ca trước.');
  }

  // Tạo ca mới
  const shift = await prisma.caLamViec.create({
    data: {
      nhanVienId,
      openingBalance,
      status: 'OPEN',
    },
    include: {
      nhanVien: { select: { id: true, fullName: true, username: true } },
    },
  });

  return shift;
};

/**
 * Đóng ca làm việc (FR-05)
 * - Nhập số tiền thực tế cuối ca
 * - Tính tổng doanh thu tiền mặt trong ca
 * - Tính chênh lệch: tiền thực tế - (tiền đầu ca + doanh thu tiền mặt)
 */
export const closeShift = async (shiftId: number, closingBalance: number) => {
  // Kiểm tra ca tồn tại và đang OPEN
  const shift = await prisma.caLamViec.findUnique({
    where: { id: shiftId },
    include: {
      donHangs: {
        where: { status: 'COMPLETED' },
        include: {
          giaoDichs: {
            where: { status: 'SUCCESS' },
            include: { pttt: true },
          },
        },
      },
    },
  });

  if (!shift) throw new Error('Ca làm việc không tồn tại');
  if (shift.status === 'CLOSED') throw new Error('Ca làm việc đã được đóng trước đó');

  // Tính tổng doanh thu tiền mặt trong ca (chỉ phương thức CASH)
  let totalCashRevenue = 0;
  let totalAllRevenue = 0;
  let totalOrders = 0;

  for (const order of shift.donHangs) {
    totalOrders++;
    for (const gd of order.giaoDichs) {
      totalAllRevenue += gd.amount;
      if (gd.pttt.name === 'CASH') {
        totalCashRevenue += gd.amount;
      }
    }
  }

  // Tính chênh lệch (FR-06)
  // Kỳ vọng = tiền đầu ca + doanh thu tiền mặt
  const expectedBalance = shift.openingBalance + totalCashRevenue;
  const difference = closingBalance - expectedBalance;

  // Cập nhật trạng thái ca
  const updatedShift = await prisma.caLamViec.update({
    where: { id: shiftId },
    data: {
      closingBalance,
      endTime: new Date(),
      status: 'CLOSED',
    },
    include: {
      nhanVien: { select: { id: true, fullName: true, username: true } },
    },
  });

  return {
    shift: updatedShift,
    summary: {
      openingBalance: shift.openingBalance,
      closingBalance,
      totalCashRevenue,
      totalAllRevenue,
      totalOrders,
      expectedBalance,
      difference,
      status: difference === 0 ? 'BALANCED' : difference > 0 ? 'SURPLUS' : 'DEFICIT',
    },
  };
};

/**
 * Lấy ca làm việc đang mở của nhân viên
 */
export const getCurrentShift = async (nhanVienId: number) => {
  const shift = await prisma.caLamViec.findFirst({
    where: { nhanVienId, status: 'OPEN' },
    include: {
      nhanVien: { select: { id: true, fullName: true, username: true } },
      _count: { select: { donHangs: true } },
    },
  });
  return shift;
};

/**
 * Lấy lịch sử ca làm việc (có phân trang)
 */
export const getShiftHistory = async (query: {
  nhanVienId?: number;
  status?: string;
  page?: number;
  limit?: number;
}) => {
  const { nhanVienId, status, page = 1, limit = 10 } = query;
  const where: any = {};

  if (nhanVienId) where.nhanVienId = nhanVienId;
  if (status) where.status = status;

  const [shifts, total] = await Promise.all([
    prisma.caLamViec.findMany({
      where,
      include: {
        nhanVien: { select: { id: true, fullName: true, username: true } },
        _count: { select: { donHangs: true } },
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { startTime: 'desc' },
    }),
    prisma.caLamViec.count({ where }),
  ]);

  return {
    data: shifts,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
};

/**
 * Lấy sản phẩm sắp hết hàng (stock <= threshold)
 * Dùng cho cảnh báo tồn kho (FR-06 mở rộng)
 */
export const getLowStockProducts = async (threshold: number = 10) => {
  const products = await prisma.sanPham.findMany({
    where: { stock: { lte: threshold } },
    include: { category: true },
    orderBy: { stock: 'asc' },
  });
  return products;
};
