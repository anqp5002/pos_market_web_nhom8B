import prisma from '../config/prisma';

export const getTransactions = async (query: {
  caLamViecId?: number;
  ptttId?: number;
  donHangId?: number;
  status?: string;
  page?: number;
  limit?: number;
}) => {
  const { caLamViecId, ptttId, donHangId, status, page = 1, limit = 20 } = query;
  const where: any = {};

  if (caLamViecId) {
    where.donHang = { caLamViecId };
  }
  if (ptttId) where.ptttId = ptttId;
  if (donHangId) where.donHangId = donHangId;
  if (status) where.status = status;

  const [transactions, total] = await Promise.all([
    prisma.giaoDich.findMany({
      where,
      include: {
        pttt: true,
        donHang: {
          include: {
            nhanVien: { select: { fullName: true } },
          },
        },
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.giaoDich.count({ where }),
  ]);

  return {
    data: transactions,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getPaymentStats = async (caLamViecId?: number) => {
  const where: any = { status: 'SUCCESS' };

  if (caLamViecId) {
    where.donHang = { caLamViecId };
  }

  // Nhóm giao dịch thành công theo phương thức thanh toán
  const stats = await prisma.giaoDich.groupBy({
    by: ['ptttId'],
    where,
    _sum: {
      amount: true,
    },
    _count: {
      id: true,
    },
  });

  // Lấy chi tiết phương thức thanh toán để map tên hiển thị
  const paymentMethods = await prisma.phuongThucThanhToan.findMany();

  const formattedStats = paymentMethods.map((pm) => {
    const stat = stats.find((s) => s.ptttId === pm.id);
    return {
      ptttId: pm.id,
      ptttName: pm.name,
      totalAmount: stat?._sum.amount || 0,
      count: stat?._count.id || 0,
    };
  });

  const totalRevenue = formattedStats.reduce((sum, item) => sum + item.totalAmount, 0);

  return {
    revenueByMethod: formattedStats,
    totalRevenue,
  };
};
