import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Seeding database...');

  // Tạo Vai Trò
  const adminRole = await prisma.vaiTro.upsert({
    where: { name: 'ADMIN' },
    update: {},
    create: { name: 'ADMIN' },
  });

  const cashierRole = await prisma.vaiTro.upsert({
    where: { name: 'CASHIER' },
    update: {},
    create: { name: 'CASHIER' },
  });

  console.log('✅ Roles created:', adminRole.name, cashierRole.name);

  // Tạo Nhân Viên mặc định (password: 123456)
  const admin = await prisma.nhanVien.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: '123456', // Sẽ hash khi có Auth module
      fullName: 'Quản Trị Viên',
      roleId: adminRole.id,
    },
  });

  const cashier = await prisma.nhanVien.upsert({
    where: { username: 'cashier01' },
    update: {},
    create: {
      username: 'cashier01',
      password: '123456',
      fullName: 'Thu Ngân 01',
      roleId: cashierRole.id,
    },
  });

  console.log('✅ Users created:', admin.username, cashier.username);

  // Tạo 5 Danh Mục
  const categories = [
    'Thực phẩm',
    'Đồ uống',
    'Đồ gia dụng',
    'Chăm sóc cá nhân',
    'Văn phòng phẩm',
  ];

  const createdCategories = [];
  for (const name of categories) {
    const cat = await prisma.danhMuc.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    createdCategories.push(cat);
  }

  console.log('✅ Categories created:', createdCategories.length);

  // Tạo 50 Sản Phẩm mẫu
  const products = [
    // Thực phẩm (category 0)
    { barcode: 'TP001', name: 'Mì Hảo Hảo tôm chua cay', price: 4500, stock: 200, catIdx: 0 },
    { barcode: 'TP002', name: 'Mì Omachi xốt Spaghetti', price: 7000, stock: 150, catIdx: 0 },
    { barcode: 'TP003', name: 'Cơm cháy chà bông 200g', price: 35000, stock: 80, catIdx: 0 },
    { barcode: 'TP004', name: 'Bánh mì sandwich Kinh Đô', price: 25000, stock: 60, catIdx: 0 },
    { barcode: 'TP005', name: 'Xúc xích Vissan 175g', price: 28000, stock: 100, catIdx: 0 },
    { barcode: 'TP006', name: 'Dầu ăn Simply 1L', price: 42000, stock: 90, catIdx: 0 },
    { barcode: 'TP007', name: 'Nước mắm Chinsu 500ml', price: 22000, stock: 120, catIdx: 0 },
    { barcode: 'TP008', name: 'Đường Biên Hòa 1kg', price: 20000, stock: 75, catIdx: 0 },
    { barcode: 'TP009', name: 'Gạo ST25 5kg', price: 120000, stock: 40, catIdx: 0 },
    { barcode: 'TP010', name: 'Bột giặt OMO 4.5kg', price: 145000, stock: 35, catIdx: 0 },

    // Đồ uống (category 1)
    { barcode: 'DU001', name: 'Coca-Cola lon 330ml', price: 10000, stock: 300, catIdx: 1 },
    { barcode: 'DU002', name: 'Pepsi lon 330ml', price: 10000, stock: 250, catIdx: 1 },
    { barcode: 'DU003', name: 'Nước suối Aquafina 500ml', price: 5000, stock: 400, catIdx: 1 },
    { barcode: 'DU004', name: 'Trà xanh 0 độ 500ml', price: 10000, stock: 180, catIdx: 1 },
    { barcode: 'DU005', name: 'Sữa Vinamilk 220ml', price: 7000, stock: 200, catIdx: 1 },
    { barcode: 'DU006', name: 'Nước ép cam Teppy 1L', price: 28000, stock: 60, catIdx: 1 },
    { barcode: 'DU007', name: 'Cà phê G7 hộp 20 gói', price: 52000, stock: 70, catIdx: 1 },
    { barcode: 'DU008', name: 'Bia Tiger lon 330ml', price: 14000, stock: 150, catIdx: 1 },
    { barcode: 'DU009', name: 'Red Bull 250ml', price: 10000, stock: 120, catIdx: 1 },
    { barcode: 'DU010', name: 'Trà sữa Kirin 345ml', price: 15000, stock: 90, catIdx: 1 },

    // Đồ gia dụng (category 2)
    { barcode: 'GD001', name: 'Nước rửa chén Sunlight 750ml', price: 28000, stock: 85, catIdx: 2 },
    { barcode: 'GD002', name: 'Nước lau sàn Mỹ Hảo 1L', price: 22000, stock: 60, catIdx: 2 },
    { barcode: 'GD003', name: 'Khăn giấy Pulppy 6 cuộn', price: 35000, stock: 50, catIdx: 2 },
    { barcode: 'GD004', name: 'Túi rác đen 1kg', price: 15000, stock: 100, catIdx: 2 },
    { barcode: 'GD005', name: 'Bóng đèn LED 9W', price: 25000, stock: 45, catIdx: 2 },
    { barcode: 'GD006', name: 'Pin AA Energizer (4 viên)', price: 45000, stock: 55, catIdx: 2 },
    { barcode: 'GD007', name: 'Keo dính chuột', price: 12000, stock: 30, catIdx: 2 },
    { barcode: 'GD008', name: 'Màng bọc thực phẩm 30cm', price: 18000, stock: 40, catIdx: 2 },
    { barcode: 'GD009', name: 'Găng tay cao su size M', price: 20000, stock: 35, catIdx: 2 },
    { barcode: 'GD010', name: 'Bọt biển rửa chén (3 miếng)', price: 10000, stock: 70, catIdx: 2 },

    // Chăm sóc cá nhân (category 3)
    { barcode: 'CN001', name: 'Dầu gội Clear 650ml', price: 95000, stock: 40, catIdx: 3 },
    { barcode: 'CN002', name: 'Sữa tắm Dove 500ml', price: 85000, stock: 45, catIdx: 3 },
    { barcode: 'CN003', name: 'Kem đánh răng P/S 180g', price: 32000, stock: 80, catIdx: 3 },
    { barcode: 'CN004', name: 'Bàn chải Oral-B', price: 25000, stock: 60, catIdx: 3 },
    { barcode: 'CN005', name: 'Nước súc miệng Listerine 250ml', price: 42000, stock: 35, catIdx: 3 },
    { barcode: 'CN006', name: 'Băng vệ sinh Diana 8 miếng', price: 22000, stock: 90, catIdx: 3 },
    { barcode: 'CN007', name: 'Khẩu trang y tế (50 cái)', price: 45000, stock: 100, catIdx: 3 },
    { barcode: 'CN008', name: 'Nước rửa tay Lifebuoy 500ml', price: 55000, stock: 50, catIdx: 3 },
    { barcode: 'CN009', name: 'Kem chống nắng Sunplay SPF50', price: 68000, stock: 25, catIdx: 3 },
    { barcode: 'CN010', name: 'Giấy ướt Bobby 100 tờ', price: 38000, stock: 55, catIdx: 3 },

    // Văn phòng phẩm (category 4)
    { barcode: 'VP001', name: 'Vở Campus 96 trang', price: 8000, stock: 200, catIdx: 4 },
    { barcode: 'VP002', name: 'Bút bi Thiên Long TL-027', price: 5000, stock: 300, catIdx: 4 },
    { barcode: 'VP003', name: 'Bút chì 2B Staedtler', price: 12000, stock: 150, catIdx: 4 },
    { barcode: 'VP004', name: 'Thước kẻ 30cm', price: 6000, stock: 100, catIdx: 4 },
    { barcode: 'VP005', name: 'Tẩy Pentel Hi-Polymer', price: 8000, stock: 120, catIdx: 4 },
    { barcode: 'VP006', name: 'Kéo văn phòng 17cm', price: 15000, stock: 40, catIdx: 4 },
    { barcode: 'VP007', name: 'Băng keo trong 2.4cm', price: 7000, stock: 80, catIdx: 4 },
    { barcode: 'VP008', name: 'Giấy A4 Double A 500 tờ', price: 75000, stock: 30, catIdx: 4 },
    { barcode: 'VP009', name: 'Bút dạ quang Stabilo', price: 18000, stock: 60, catIdx: 4 },
    { barcode: 'VP010', name: 'Sổ tay bìa cứng A5', price: 25000, stock: 45, catIdx: 4 },
  ];

  for (const p of products) {
    await prisma.sanPham.upsert({
      where: { barcode: p.barcode },
      update: {},
      create: {
        barcode: p.barcode,
        name: p.name,
        price: p.price,
        stock: p.stock,
        categoryId: createdCategories[p.catIdx].id,
      },
    });
  }

  console.log('✅ Products created:', products.length);

  // Tạo 20 Khách Hàng mẫu
  const customers = [
    { name: 'Nguyễn Văn An', phone: '0901234001', email: 'an@gmail.com' },
    { name: 'Trần Thị Bích', phone: '0901234002', email: 'bich@gmail.com' },
    { name: 'Lê Hoàng Cường', phone: '0901234003', email: 'cuong@gmail.com' },
    { name: 'Phạm Thị Dung', phone: '0901234004', email: 'dung@gmail.com' },
    { name: 'Hoàng Văn Em', phone: '0901234005', email: null },
    { name: 'Vũ Thị Phương', phone: '0901234006', email: 'phuong@gmail.com' },
    { name: 'Đặng Minh Giang', phone: '0901234007', email: null },
    { name: 'Bùi Thị Hoa', phone: '0901234008', email: 'hoa@gmail.com' },
    { name: 'Ngô Quang Huy', phone: '0901234009', email: 'huy@gmail.com' },
    { name: 'Lý Thị Kim', phone: '0901234010', email: null },
    { name: 'Trương Văn Lâm', phone: '0901234011', email: 'lam@gmail.com' },
    { name: 'Đinh Thị Mai', phone: '0901234012', email: 'mai@gmail.com' },
    { name: 'Phan Văn Nam', phone: '0901234013', email: null },
    { name: 'Dương Thị Oanh', phone: '0901234014', email: 'oanh@gmail.com' },
    { name: 'Hồ Quốc Phong', phone: '0901234015', email: 'phong@gmail.com' },
    { name: 'Tạ Thị Quỳnh', phone: '0901234016', email: null },
    { name: 'Châu Văn Rạng', phone: '0901234017', email: 'rang@gmail.com' },
    { name: 'Lương Thị Sương', phone: '0901234018', email: 'suong@gmail.com' },
    { name: 'Mai Văn Tài', phone: '0901234019', email: null },
    { name: 'Võ Thị Uyên', phone: '0901234020', email: 'uyen@gmail.com' },
  ];

  for (const c of customers) {
    await prisma.khachHang.upsert({
      where: { phone: c.phone! },
      update: {},
      create: c,
    });
  }

  console.log('✅ Customers created:', customers.length);

  // Tạo Phương Thức Thanh Toán
  const paymentMethods = ['CASH', 'CREDIT_CARD', 'QR_CODE'];
  for (const name of paymentMethods) {
    await prisma.phuongThucThanhToan.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  console.log('✅ Payment methods created');
  console.log('🎉 Seed completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
