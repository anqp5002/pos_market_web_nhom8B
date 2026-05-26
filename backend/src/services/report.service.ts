import prisma from '../config/prisma';

/**
 * Lấy thống kê tổng quan cho Dashboard
 * FR-24: Tổng hợp báo cáo
 */
export const getDashboardStats = async (period?: string) => {
  const now = new Date();
  let startDate: Date;

  switch (period) {
    case 'week':
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 7);
      break;
    case 'month':
      startDate = new Date(now);
      startDate.setMonth(now.getMonth() - 1);
      break;
    case 'year':
      startDate = new Date(now);
      startDate.setFullYear(now.getFullYear() - 1);
      break;
    default: // today
      startDate = new Date(now);
      startDate.setHours(0, 0, 0, 0);
  }

  const dateFilter = { createdAt: { gte: startDate } };

  // Chạy song song tất cả query để tối ưu tốc độ
  const [
    totalRevenue,
    totalOrders,
    completedOrders,
    cancelledOrders,
    totalProducts,
    lowStockProducts,
    totalCustomers,
  ] = await Promise.all([
    // Tổng doanh thu (chỉ tính đơn COMPLETED)
    prisma.donHang.aggregate({
      _sum: { total: true },
      where: { status: 'COMPLETED', ...dateFilter },
    }),
    // Tổng số đơn
    prisma.donHang.count({ where: dateFilter }),
    // Đơn hoàn thành
    prisma.donHang.count({ where: { status: 'COMPLETED', ...dateFilter } }),
    // Đơn hủy
    prisma.donHang.count({ where: { status: 'CANCELLED', ...dateFilter } }),
    // Tổng SP
    prisma.sanPham.count(),
    // SP sắp hết hàng (stock <= 10)
    prisma.sanPham.count({ where: { stock: { lte: 10 } } }),
    // Tổng KH
    prisma.khachHang.count(),
  ]);

  return {
    revenue: totalRevenue._sum.total || 0,
    totalOrders,
    completedOrders,
    cancelledOrders,
    totalProducts,
    lowStockProducts,
    totalCustomers,
    period: period || 'today',
  };
};

/**
 * Lấy doanh thu theo ngày (7 ngày gần nhất hoặc tùy chỉnh)
 * FR-24: Biểu đồ doanh thu
 */
export const getSalesChart = async (days: number = 7) => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  startDate.setHours(0, 0, 0, 0);

  // Lấy tất cả đơn hàng COMPLETED trong khoảng thời gian
  const orders = await prisma.donHang.findMany({
    where: {
      status: 'COMPLETED',
      createdAt: { gte: startDate },
    },
    select: {
      total: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'asc' },
  });

  // Nhóm doanh thu theo ngày
  const dailyMap = new Map<string, { revenue: number; orders: number }>();

  // Tạo sẵn tất cả các ngày (kể cả ngày không có đơn)
  for (let i = 0; i < days; i++) {
    const d = new Date();
    d.setDate(d.getDate() - (days - 1 - i));
    const key = d.toISOString().split('T')[0]; // YYYY-MM-DD
    dailyMap.set(key, { revenue: 0, orders: 0 });
  }

  // Gom dữ liệu thực tế
  for (const order of orders) {
    const key = order.createdAt.toISOString().split('T')[0];
    const existing = dailyMap.get(key);
    if (existing) {
      existing.revenue += order.total;
      existing.orders += 1;
    }
  }

  // Chuyển Map thành Array để trả về
  const chartData = Array.from(dailyMap.entries()).map(([date, data]) => ({
    date,
    label: new Date(date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
    revenue: Math.round(data.revenue),
    orders: data.orders,
  }));

  return chartData;
};

/**
 * Lấy top sản phẩm bán chạy
 * FR-24: Bảng/chart SP bán chạy
 */
export const getTopProducts = async (limit: number = 10, days: number = 30) => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  // Group by sanPhamId, tính tổng số lượng đã bán
  const topItems = await prisma.chiTietDonHang.groupBy({
    by: ['sanPhamId'],
    _sum: { quantity: true },
    _count: { id: true },
    where: {
      donHang: {
        status: 'COMPLETED',
        createdAt: { gte: startDate },
      },
    },
    orderBy: { _sum: { quantity: 'desc' } },
    take: limit,
  });

  // Lấy thông tin chi tiết sản phẩm
  const productIds = topItems.map((item) => item.sanPhamId);
  const products = await prisma.sanPham.findMany({
    where: { id: { in: productIds } },
    include: { category: true },
  });

  // Map kết quả
  const result = topItems.map((item) => {
    const product = products.find((p) => p.id === item.sanPhamId);
    return {
      id: item.sanPhamId,
      name: product?.name || 'Không rõ',
      barcode: product?.barcode || '',
      category: product?.category?.name || '',
      totalSold: item._sum.quantity || 0,
      totalOrders: item._count.id || 0,
      revenue: (item._sum.quantity || 0) * (product?.price || 0),
      stock: product?.stock || 0,
    };
  });

  return result;
};
