import prisma from '../config/prisma';

export const generateInvoiceNumber = async (): Promise<string> => {
  const now = new Date();
  const dateStr =
    now.getFullYear().toString() +
    (now.getMonth() + 1).toString().padStart(2, '0') +
    now.getDate().toString().padStart(2, '0');

  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

  // Đếm số lượng hóa đơn đã xuất trong ngày hôm nay
  const count = await prisma.hoaDon.count({
    where: {
      donHang: {
        createdAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    },
  });

  const sequentialNumber = (count + 1).toString().padStart(4, '0');
  return `HD-${dateStr}-${sequentialNumber}`;
};

export const createInvoice = async (donHangId: number, tx: any) => {
  const invoiceNumber = await generateInvoiceNumber();

  return tx.hoaDon.create({
    data: {
      donHangId,
      invoiceNumber,
    },
  });
};
