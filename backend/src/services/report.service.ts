import prisma from '../config/prisma';

export const getDailyStats = async () => {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

  // Thống kê doanh thu và số lượng đơn hàng hoàn thành
  const completedOrders = await prisma.donHang.findMany({
    where: {
      status: 'COMPLETED',
      createdAt: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
  });

  const allOrders = await prisma.donHang.groupBy({
    by: ['status'],
    where: {
      createdAt: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
    _count: {
      id: true,
    },
  });

  const revenue = completedOrders.reduce((sum, order) => sum + order.total, 0);
  const totalCompletedOrders = completedOrders.length;
  const avgOrderValue = totalCompletedOrders > 0 ? revenue / totalCompletedOrders : 0;

  // Lấy chi tiết số đơn của từng trạng thái
  const orderCounts = {
    PENDING: allOrders.find((o) => o.status === 'PENDING')?._count.id || 0,
    COMPLETED: totalCompletedOrders,
    CANCELLED: allOrders.find((o) => o.status === 'CANCELLED')?._count.id || 0,
    TOTAL: allOrders.reduce((sum, o) => sum + o._count.id, 0),
  };

  return {
    revenue,
    orderCounts,
    avgOrderValue,
  };
};

export const getPeriodStats = async (startDateStr: string, endDateStr: string) => {
  const startDate = new Date(startDateStr);
  startDate.setHours(0, 0, 0, 0);
  const endDate = new Date(endDateStr);
  endDate.setHours(23, 59, 59, 999);

  // Tìm tất cả các đơn hàng hoàn thành trong khoảng thời gian
  const orders = await prisma.donHang.findMany({
    where: {
      status: 'COMPLETED',
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    select: {
      total: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: 'asc',
    },
  });

  // Gom nhóm theo ngày
  const dailyGroups: Record<string, { revenue: number; orderCount: number }> = {};

  orders.forEach((order) => {
    const dayStr = order.createdAt.toISOString().split('T')[0];
    if (!dailyGroups[dayStr]) {
      dailyGroups[dayStr] = { revenue: 0, orderCount: 0 };
    }
    dailyGroups[dayStr].revenue += order.total;
    dailyGroups[dayStr].orderCount += 1;
  });

  const chartData = Object.entries(dailyGroups).map(([date, data]) => ({
    date,
    revenue: data.revenue,
    orderCount: data.orderCount,
  }));

  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);

  return {
    chartData,
    totalRevenue,
    totalOrders: orders.length,
  };
};

export const getTopSellingProducts = async (limit: number = 10) => {
  // Lấy dữ liệu bán hàng nhóm theo sản phẩm
  const topProducts = await prisma.chiTietDonHang.groupBy({
    by: ['sanPhamId'],
    where: {
      donHang: {
        status: 'COMPLETED',
      },
    },
    _sum: {
      quantity: true,
      price: true,
    },
    orderBy: {
      _sum: {
        quantity: 'desc',
      },
    },
    take: limit,
  });

  // Lấy chi tiết thông tin sản phẩm
  const productIds = topProducts.map((p) => p.sanPhamId);
  const products = await prisma.sanPham.findMany({
    where: {
      id: { in: productIds },
    },
    include: {
      category: true,
    },
  });

  const formattedTopProducts = topProducts.map((tp) => {
    const product = products.find((p) => p.id === tp.sanPhamId);
    const quantitySold = tp._sum.quantity || 0;
    return {
      productId: tp.sanPhamId,
      name: product?.name || 'Sản phẩm đã bị xóa',
      barcode: product?.barcode || '',
      categoryName: product?.category.name || '',
      price: product?.price || 0,
      quantitySold,
      totalRevenue: (product?.price || 0) * quantitySold,
    };
  });

  // Đảm bảo sắp xếp đúng theo số lượng bán giảm dần
  formattedTopProducts.sort((a, b) => b.quantitySold - a.quantitySold);

  return formattedTopProducts;
};

export const exportCSV = async (startDateStr?: string, endDateStr?: string): Promise<string> => {
  const where: any = { status: 'COMPLETED' };

  if (startDateStr && endDateStr) {
    const startDate = new Date(startDateStr);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(endDateStr);
    endDate.setHours(23, 59, 59, 999);
    where.createdAt = { gte: startDate, lte: endDate };
  }

  const orders = await prisma.donHang.findMany({
    where,
    include: {
      nhanVien: { select: { fullName: true } },
      khachHang: { select: { name: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  // UTF-8 BOM to ensure Excel opens it correctly with Vietnamese accents
  let csv = '\uFEFF';
  
  // Headers
  csv += 'Mã đơn hàng,Ngày tạo,Thu ngân,Khách hàng,Tổng tiền (₫),Trạng thái\n';

  // Rows
  orders.forEach((order) => {
    const orderId = order.id;
    const date = order.createdAt.toLocaleString('vi-VN');
    const cashier = order.nhanVien.fullName.replace(/,/g, '');
    const customer = order.khachHang ? order.khachHang.name.replace(/,/g, '') : 'Khách vãng lai';
    const total = order.total;
    const status = order.status;

    csv += `${orderId},${date},${cashier},${customer},${total},${status}\n`;
  });

  return csv;
};
