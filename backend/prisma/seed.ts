import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Bắt đầu seed data...');

  // ========== 1. Tạo vai trò ==========
  const adminRole = await prisma.vaiTro.upsert({
    where: { name: 'Admin' },
    update: {},
    create: { name: 'Admin' },
  });

  const cashierRole = await prisma.vaiTro.upsert({
    where: { name: 'Cashier' },
    update: {},
    create: { name: 'Cashier' },
  });

  console.log('✅ Vai trò: Admin, Cashier');

  // ========== 2. Tạo nhân viên mặc định ==========
  const hashedPassword = await bcrypt.hash('123456', 10);

  await prisma.nhanVien.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: hashedPassword,
      fullName: 'Quản trị viên',
      roleId: adminRole.id,
    },
  });

  await prisma.nhanVien.upsert({
    where: { username: 'cashier01' },
    update: {},
    create: {
      username: 'cashier01',
      password: hashedPassword,
      fullName: 'Thu ngân 01',
      roleId: cashierRole.id,
    },
  });

  await prisma.nhanVien.upsert({
    where: { username: 'cashier02' },
    update: {},
    create: {
      username: 'cashier02',
      password: hashedPassword,
      fullName: 'Thu ngân 02',
      roleId: cashierRole.id,
    },
  });

  console.log('✅ Nhân viên: admin, cashier01, cashier02 (password: 123456)');

  // ========== 3. Tạo phương thức thanh toán ==========
  const paymentMethods = ['CASH', 'CREDIT_CARD', 'QR_CODE'];
  for (const name of paymentMethods) {
    await prisma.phuongThucThanhToan.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  console.log('✅ Phương thức thanh toán: CASH, CREDIT_CARD, QR_CODE');

  // ========== 4. Tạo danh mục sản phẩm ==========
  const categories = ['Thực phẩm', 'Đồ uống', 'Gia dụng', 'Bánh kẹo', 'Sữa & Bơ'];
  for (const name of categories) {
    await prisma.danhMuc.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  console.log('✅ Danh mục: 5 danh mục');

  // ========== 5. Tạo sản phẩm mẫu (50 SP) ==========
  const allCategories = await prisma.danhMuc.findMany();
  const catMap: Record<string, number> = {};
  for (const c of allCategories) {
    catMap[c.name] = c.id;
  }

  const products = [
    // Thực phẩm (10)
    { barcode: 'SP001', name: 'Mì Hảo Hảo tôm chua cay', price: 4500, stock: 200, categoryId: catMap['Thực phẩm'] },
    { barcode: 'SP002', name: 'Mì Omachi xốt Spaghetti', price: 8000, stock: 150, categoryId: catMap['Thực phẩm'] },
    { barcode: 'SP003', name: 'Phở Vifon bò', price: 7500, stock: 120, categoryId: catMap['Thực phẩm'] },
    { barcode: 'SP004', name: 'Cháo ăn liền Cây Thị', price: 6000, stock: 100, categoryId: catMap['Thực phẩm'] },
    { barcode: 'SP005', name: 'Xúc xích Vissan 40g', price: 5000, stock: 300, categoryId: catMap['Thực phẩm'] },
    { barcode: 'SP006', name: 'Cá hộp 3 Cô Gái', price: 15000, stock: 80, categoryId: catMap['Thực phẩm'] },
    { barcode: 'SP007', name: 'Pate Hạ Long 90g', price: 12000, stock: 90, categoryId: catMap['Thực phẩm'] },
    { barcode: 'SP008', name: 'Nước mắm Nam Ngư 500ml', price: 25000, stock: 60, categoryId: catMap['Thực phẩm'] },
    { barcode: 'SP009', name: 'Dầu ăn Tường An 1L', price: 38000, stock: 50, categoryId: catMap['Thực phẩm'] },
    { barcode: 'SP010', name: 'Gạo ST25 5kg', price: 120000, stock: 30, categoryId: catMap['Thực phẩm'] },
    // Đồ uống (10)
    { barcode: 'DU001', name: 'Coca Cola 330ml', price: 10000, stock: 250, categoryId: catMap['Đồ uống'] },
    { barcode: 'DU002', name: 'Pepsi 330ml', price: 10000, stock: 250, categoryId: catMap['Đồ uống'] },
    { barcode: 'DU003', name: 'Trà xanh 0 độ 500ml', price: 10000, stock: 200, categoryId: catMap['Đồ uống'] },
    { barcode: 'DU004', name: 'Nước suối Aquafina 500ml', price: 5000, stock: 400, categoryId: catMap['Đồ uống'] },
    { barcode: 'DU005', name: 'Red Bull 250ml', price: 10000, stock: 180, categoryId: catMap['Đồ uống'] },
    { barcode: 'DU006', name: 'Sting dâu 330ml', price: 8000, stock: 200, categoryId: catMap['Đồ uống'] },
    { barcode: 'DU007', name: 'Nước cam Teppy 327ml', price: 8000, stock: 150, categoryId: catMap['Đồ uống'] },
    { barcode: 'DU008', name: 'Cà phê G7 3in1 hộp 20 gói', price: 55000, stock: 40, categoryId: catMap['Đồ uống'] },
    { barcode: 'DU009', name: 'Trà sữa Nestea 16g x 10', price: 35000, stock: 60, categoryId: catMap['Đồ uống'] },
    { barcode: 'DU010', name: 'Nước yến Thiên Sơn 315ml', price: 15000, stock: 100, categoryId: catMap['Đồ uống'] },
    // Gia dụng (10)
    { barcode: 'GD001', name: 'Bàn chải đánh răng P/S', price: 15000, stock: 100, categoryId: catMap['Gia dụng'] },
    { barcode: 'GD002', name: 'Kem đánh răng Colgate 150g', price: 28000, stock: 80, categoryId: catMap['Gia dụng'] },
    { barcode: 'GD003', name: 'Nước rửa chén Sunlight 750ml', price: 32000, stock: 70, categoryId: catMap['Gia dụng'] },
    { barcode: 'GD004', name: 'Bột giặt OMO 3kg', price: 105000, stock: 40, categoryId: catMap['Gia dụng'] },
    { barcode: 'GD005', name: 'Dầu gội Clear 650ml', price: 115000, stock: 35, categoryId: catMap['Gia dụng'] },
    { barcode: 'GD006', name: 'Sữa tắm Dove 500g', price: 85000, stock: 50, categoryId: catMap['Gia dụng'] },
    { barcode: 'GD007', name: 'Giấy vệ sinh Pulppy 12 cuộn', price: 65000, stock: 60, categoryId: catMap['Gia dụng'] },
    { barcode: 'GD008', name: 'Khăn giấy Kleenex 100 tờ', price: 22000, stock: 120, categoryId: catMap['Gia dụng'] },
    { barcode: 'GD009', name: 'Nước xả Comfort 3.2L', price: 145000, stock: 25, categoryId: catMap['Gia dụng'] },
    { barcode: 'GD010', name: 'Nước tẩy Javel 1L', price: 18000, stock: 90, categoryId: catMap['Gia dụng'] },
    // Bánh kẹo (10)
    { barcode: 'BK001', name: 'Bánh Oreo 133g', price: 22000, stock: 100, categoryId: catMap['Bánh kẹo'] },
    { barcode: 'BK002', name: 'Snack Oishi tôm 42g', price: 7000, stock: 200, categoryId: catMap['Bánh kẹo'] },
    { barcode: 'BK003', name: 'Kẹo dẻo Trolli 100g', price: 25000, stock: 80, categoryId: catMap['Bánh kẹo'] },
    { barcode: 'BK004', name: 'Socola KitKat 4 thanh', price: 20000, stock: 120, categoryId: catMap['Bánh kẹo'] },
    { barcode: 'BK005', name: 'Bánh quy Cosy 288g', price: 35000, stock: 60, categoryId: catMap['Bánh kẹo'] },
    { barcode: 'BK006', name: 'Kẹo Alpenliebe hũ 16 viên', price: 18000, stock: 150, categoryId: catMap['Bánh kẹo'] },
    { barcode: 'BK007', name: 'Bánh Chocopie 6 cái', price: 28000, stock: 90, categoryId: catMap['Bánh kẹo'] },
    { barcode: 'BK008', name: 'Snack Lay\'s Classic 95g', price: 18000, stock: 110, categoryId: catMap['Bánh kẹo'] },
    { barcode: 'BK009', name: 'Kẹo cao su Doublemint 15 viên', price: 12000, stock: 200, categoryId: catMap['Bánh kẹo'] },
    { barcode: 'BK010', name: 'Bánh tráng me Tây Ninh 200g', price: 30000, stock: 70, categoryId: catMap['Bánh kẹo'] },
    // Sữa & Bơ (10)
    { barcode: 'SB001', name: 'Sữa tươi Vinamilk 1L', price: 32000, stock: 80, categoryId: catMap['Sữa & Bơ'] },
    { barcode: 'SB002', name: 'Sữa TH True Milk 1L', price: 35000, stock: 60, categoryId: catMap['Sữa & Bơ'] },
    { barcode: 'SB003', name: 'Sữa đặc Ông Thọ 380g', price: 22000, stock: 100, categoryId: catMap['Sữa & Bơ'] },
    { barcode: 'SB004', name: 'Sữa chua Vinamilk có đường 100g x 4', price: 22000, stock: 120, categoryId: catMap['Sữa & Bơ'] },
    { barcode: 'SB005', name: 'Phô mai con bò cười 8 miếng', price: 35000, stock: 70, categoryId: catMap['Sữa & Bơ'] },
    { barcode: 'SB006', name: 'Bơ thực vật Meizan 200g', price: 18000, stock: 50, categoryId: catMap['Sữa & Bơ'] },
    { barcode: 'SB007', name: 'Sữa đậu nành Fami 200ml x 6', price: 25000, stock: 90, categoryId: catMap['Sữa & Bơ'] },
    { barcode: 'SB008', name: 'Sữa Ensure Gold 400g', price: 285000, stock: 20, categoryId: catMap['Sữa & Bơ'] },
    { barcode: 'SB009', name: 'Yakult lốc 5 chai', price: 22000, stock: 100, categoryId: catMap['Sữa & Bơ'] },
    { barcode: 'SB010', name: 'Sữa bột NAN Optipro 800g', price: 395000, stock: 15, categoryId: catMap['Sữa & Bơ'] },
  ];

  for (const p of products) {
    await prisma.sanPham.upsert({
      where: { barcode: p.barcode },
      update: {},
      create: p,
    });
  }

  console.log('✅ Sản phẩm: 50 sản phẩm mẫu');

  // ========== 6. Tạo khách hàng mẫu (20 KH) ==========
  const customers = [
    { name: 'Nguyễn Văn An', phone: '0901000001', email: 'an@email.com' },
    { name: 'Trần Thị Bình', phone: '0901000002', email: 'binh@email.com' },
    { name: 'Lê Hoàng Cường', phone: '0901000003', email: 'cuong@email.com' },
    { name: 'Phạm Thúy Dung', phone: '0901000004', email: 'dung@email.com' },
    { name: 'Hoàng Minh Em', phone: '0901000005', email: 'em@email.com' },
    { name: 'Võ Thanh Phong', phone: '0901000006', email: 'phong@email.com' },
    { name: 'Đặng Bích Giang', phone: '0901000007', email: 'giang@email.com' },
    { name: 'Bùi Quốc Hùng', phone: '0901000008', email: 'hung@email.com' },
    { name: 'Ngô Thị Ịnh', phone: '0901000009', email: null },
    { name: 'Lý Gia Khang', phone: '0901000010', email: 'khang@email.com' },
    { name: 'Trương Mỹ Linh', phone: '0901000011', email: 'linh@email.com' },
    { name: 'Đinh Văn Mạnh', phone: '0901000012', email: null },
    { name: 'Hồ Nhật Nam', phone: '0901000013', email: 'nam@email.com' },
    { name: 'Châu Thị Oanh', phone: '0901000014', email: 'oanh@email.com' },
    { name: 'Dương Anh Phúc', phone: '0901000015', email: null },
    { name: 'Mai Thị Quỳnh', phone: '0901000016', email: 'quynh@email.com' },
    { name: 'Phan Văn Rạng', phone: '0901000017', email: null },
    { name: 'Tạ Minh Sơn', phone: '0901000018', email: 'son@email.com' },
    { name: 'Lưu Đức Toàn', phone: '0901000019', email: 'toan@email.com' },
    { name: 'Huỳnh Yến Vy', phone: '0901000020', email: 'vy@email.com' },
  ];

  for (const c of customers) {
    await prisma.khachHang.upsert({
      where: { phone: c.phone! },
      update: {},
      create: c,
    });
  }

  console.log('✅ Khách hàng: 20 khách hàng mẫu');
  console.log('');
  console.log('🎉 Seed hoàn tất!');
  console.log('📌 Tài khoản đăng nhập:');
  console.log('   admin / 123456 (Quản trị viên)');
  console.log('   cashier01 / 123456 (Thu ngân 01)');
  console.log('   cashier02 / 123456 (Thu ngân 02)');
}

main()
  .catch((e) => {
    console.error('❌ Seed lỗi:', e);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
