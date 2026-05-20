-- CreateTable
CREATE TABLE "VaiTro" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "VaiTro_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NhanVien" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "roleId" INTEGER NOT NULL,

    CONSTRAINT "NhanVien_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KhachHang" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,

    CONSTRAINT "KhachHang_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CaLamViec" (
    "id" SERIAL NOT NULL,
    "nhanVienId" INTEGER NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endTime" TIMESTAMP(3),
    "openingBalance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "closingBalance" DOUBLE PRECISION,
    "status" TEXT NOT NULL DEFAULT 'OPEN',

    CONSTRAINT "CaLamViec_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DanhMuc" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "DanhMuc_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SanPham" (
    "id" SERIAL NOT NULL,
    "barcode" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "categoryId" INTEGER NOT NULL,

    CONSTRAINT "SanPham_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DonHang" (
    "id" SERIAL NOT NULL,
    "nhanVienId" INTEGER NOT NULL,
    "caLamViecId" INTEGER NOT NULL,
    "khachHangId" INTEGER,
    "total" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DonHang_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChiTietDonHang" (
    "id" SERIAL NOT NULL,
    "donHangId" INTEGER NOT NULL,
    "sanPhamId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "ChiTietDonHang_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PhuongThucThanhToan" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "PhuongThucThanhToan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GiaoDich" (
    "id" SERIAL NOT NULL,
    "donHangId" INTEGER NOT NULL,
    "ptttId" INTEGER NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'SUCCESS',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GiaoDich_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HoaDon" (
    "id" SERIAL NOT NULL,
    "donHangId" INTEGER NOT NULL,
    "invoiceNumber" TEXT NOT NULL,
    "printedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HoaDon_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "VaiTro_name_key" ON "VaiTro"("name");

-- CreateIndex
CREATE UNIQUE INDEX "NhanVien_username_key" ON "NhanVien"("username");

-- CreateIndex
CREATE UNIQUE INDEX "KhachHang_phone_key" ON "KhachHang"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "DanhMuc_name_key" ON "DanhMuc"("name");

-- CreateIndex
CREATE UNIQUE INDEX "SanPham_barcode_key" ON "SanPham"("barcode");

-- CreateIndex
CREATE UNIQUE INDEX "PhuongThucThanhToan_name_key" ON "PhuongThucThanhToan"("name");

-- CreateIndex
CREATE UNIQUE INDEX "HoaDon_donHangId_key" ON "HoaDon"("donHangId");

-- CreateIndex
CREATE UNIQUE INDEX "HoaDon_invoiceNumber_key" ON "HoaDon"("invoiceNumber");

-- AddForeignKey
ALTER TABLE "NhanVien" ADD CONSTRAINT "NhanVien_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "VaiTro"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaLamViec" ADD CONSTRAINT "CaLamViec_nhanVienId_fkey" FOREIGN KEY ("nhanVienId") REFERENCES "NhanVien"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SanPham" ADD CONSTRAINT "SanPham_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "DanhMuc"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DonHang" ADD CONSTRAINT "DonHang_nhanVienId_fkey" FOREIGN KEY ("nhanVienId") REFERENCES "NhanVien"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DonHang" ADD CONSTRAINT "DonHang_caLamViecId_fkey" FOREIGN KEY ("caLamViecId") REFERENCES "CaLamViec"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DonHang" ADD CONSTRAINT "DonHang_khachHangId_fkey" FOREIGN KEY ("khachHangId") REFERENCES "KhachHang"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChiTietDonHang" ADD CONSTRAINT "ChiTietDonHang_donHangId_fkey" FOREIGN KEY ("donHangId") REFERENCES "DonHang"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChiTietDonHang" ADD CONSTRAINT "ChiTietDonHang_sanPhamId_fkey" FOREIGN KEY ("sanPhamId") REFERENCES "SanPham"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GiaoDich" ADD CONSTRAINT "GiaoDich_donHangId_fkey" FOREIGN KEY ("donHangId") REFERENCES "DonHang"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GiaoDich" ADD CONSTRAINT "GiaoDich_ptttId_fkey" FOREIGN KEY ("ptttId") REFERENCES "PhuongThucThanhToan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HoaDon" ADD CONSTRAINT "HoaDon_donHangId_fkey" FOREIGN KEY ("donHangId") REFERENCES "DonHang"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
