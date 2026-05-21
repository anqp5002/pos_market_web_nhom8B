# Kế Hoạch Triển Khai Web POS — Nhóm 6

## Phần 1: Tổng Quan

> Dự án POS được triển khai **song song** trên 2 nền tảng: Desktop (WPF .NET 8) và **Web (Next.js + Express)**. File này là plan cho nhánh **Web**.
> Dùng chung: 8 UC, 26 FR, 10 bảng DB, ERD từ giai đoạn thiết kế.

| Thông tin | Chi tiết |
|-----------|----------|
| Môn học | INT1334 – Lập trình Web |
| Trọng số | 50% điểm học phần |
| Thời gian | 5 tuần (Tuần 10 → 15), Bảo vệ Tuần 15-16 |
| Nhóm | 3 Dev (A, B, C) |
| Ngôn ngữ | TypeScript (điểm cộng) |
| Code | `D:\thuc_tap_co_so\web_pos\` |

---

## Phần 2: Công Nghệ Bắt Buộc (Theo PDF Mục III)

### 2.1 Stack Chính

| # | Layer | Công nghệ | Bắt buộc? | Ghi chú |
|---|-------|-----------|-----------|---------|
| 1 | **Frontend** | Next.js 14+ (App Router) | ✅ | ≥5 route, Dynamic Route, Nested Layout |
| 2 | **CSS** | Tailwind CSS | ✅ | Responsive Mobile/Tablet/Desktop, dark mode |
| 3 | **UI Lib** | shadcn/ui + Radix UI | Gợi ý | Component library cho Next.js |
| 4 | **Rendering** | SSR + SSG (≥2 strategy) | ✅ | Giải thích lý do trong báo cáo |
| 5 | **State** | Zustand + useState/useEffect | ✅ | Global state: cart, auth |
| 6 | **Form** | React Hook Form + Zod | ✅ | ≥2 form validate phức tạp |
| 7 | **Backend** | Node.js + Express.js | ✅ | MVC/Router-Controller, ≥4 entity CRUD |
| 8 | **Database** | PostgreSQL + Prisma | ✅ | Migration + seed data |
| 9 | **Auth** | NextAuth.js v5 + JWT Refresh | ✅ | ≥2 role (Admin, Cashier) |
| 10 | **Server Actions** | Next.js Server Actions | ✅ | ≥1 tính năng (đổi password, update profile) |
| 11 | **Deploy FE** | Vercel | ✅ | Link live hoạt động khi bảo vệ |
| 12 | **Deploy BE** | Render / Railway | ✅ | Backend + DB production |
| 13 | **Deploy DB** | Supabase / Neon | ✅ | PostgreSQL cloud |
| 14 | **GitHub** | Git branching, ≥20 commit/người | ✅ | PR review, .env.example |

### 2.2 Tính Năng Nâng Cao (5 tính năng — POS Siêu thị)

| # | Tính năng | Thư viện | Áp dụng | Điểm |
|---|-----------|----------|---------|------|
| a | Realtime | Socket.io | Cảnh báo tồn kho thấp, cập nhật đơn hàng live | Bắt buộc ≥2 |
| d | Xuất PDF | jsPDF / PDFKit | In hóa đơn, xuất báo cáo doanh thu | Bắt buộc ≥2 |
| e | AI API | Gemini (Vercel AI SDK) | Gợi ý SP mua kèm, phân tích xu hướng | Extra +0.3đ |
| c | Email | Nodemailer / Resend | Gửi hóa đơn điện tử cho KH | Thêm |
| h | Thanh toán mock | VNPay/Momo mock | QR code thanh toán giả lập | Thêm |

### 2.3 Điểm Cộng Nhắm (+1.0đ)

| Hạng mục | Điểm | Nhắm? |
|----------|------|-------|
| Testing (Jest ≥5 test cases) | +0.3đ | ✅ |
| AI API (Gemini) | +0.3đ | ✅ |
| Docker Compose (local) | +0.2đ | ✅ |
| TypeScript | +cộng | ✅ |

### 2.4 Cấu Trúc Thư Mục

```
web_pos/
├── docker-compose.yml              # PostgreSQL local dev
├── .gitignore
├── README.md
├── .env.example                    # ✅ BẮT BUỘC (không lộ key)
│
├── frontend/                       # Next.js 14+ App Router
│   ├── package.json
│   ├── next.config.ts
│   ├── tailwind.config.ts
│   ├── app/
│   │   ├── layout.tsx              # Root layout
│   │   ├── page.tsx                # Landing/redirect
│   │   ├── (auth)/                 # Auth group layout
│   │   │   ├── layout.tsx
│   │   │   ├── login/page.tsx      # S-LOGIN-001
│   │   │   └── register/page.tsx
│   │   ├── (dashboard)/            # Dashboard group layout
│   │   │   ├── layout.tsx          # Sidebar + Header
│   │   │   ├── pos/page.tsx        # S-MPS-001 (POS chính)
│   │   │   ├── orders/
│   │   │   │   ├── page.tsx        # Danh sách đơn
│   │   │   │   └── [orderId]/page.tsx  # Dynamic route
│   │   │   ├── products/page.tsx   # Quản lý SP (Admin)
│   │   │   ├── customers/page.tsx  # Quản lý KH (Admin)
│   │   │   ├── reports/page.tsx    # S-RPT-001
│   │   │   ├── shift/page.tsx      # S-OPEN-002, S-CLOSE-003
│   │   │   └── settings/page.tsx
│   │   ├── loading.tsx             # Global loading
│   │   └── error.tsx               # Global error
│   ├── components/                 # Shared UI components
│   │   ├── ui/                     # shadcn/ui components
│   │   ├── cart/CartSidebar.tsx
│   │   ├── pos/ProductCard.tsx
│   │   └── layout/Sidebar.tsx
│   ├── lib/
│   │   ├── auth.ts                 # NextAuth config
│   │   ├── api.ts                  # Axios/fetch wrapper
│   │   ├── validators.ts           # Zod schemas
│   │   └── socket.ts               # Socket.io client
│   ├── stores/                     # Zustand stores
│   │   ├── cartStore.ts
│   │   ├── authStore.ts
│   │   └── shiftStore.ts
│   └── actions/                    # Server Actions
│       └── profile.ts
│
├── backend/                        # Express.js API
│   ├── package.json
│   ├── prisma/
│   │   ├── schema.prisma           # Code-First DB schema
│   │   ├── migrations/
│   │   └── seed.ts                 # Dữ liệu mẫu
│   ├── src/
│   │   ├── server.ts               # Entry point
│   │   ├── config/                 # DB, env config
│   │   ├── middleware/
│   │   │   ├── auth.middleware.ts   # JWT verify
│   │   │   ├── role.middleware.ts   # Role check
│   │   │   └── error.middleware.ts
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── services/
│   │   └── utils/
│   │       ├── pdf.ts              # jsPDF generator
│   │       ├── email.ts            # Nodemailer
│   │       └── ai.ts               # Gemini API
│   └── tests/                      # Jest/Vitest
│
└── docs/
    └── api-spec.md
```

---

## Phần 3: Task List Chi Tiết (6 Sprint × 3 Dev)

### Quy Tắc Git (theo PDF mục 6.1)
- Nhánh chính: `main` + `develop`
- Feature: `feature/<tên>`, Fix: `fix/<tên>`
- ≥20 commit meaningful / người
- Mỗi PR phải có ≥1 người review
- Commit chuẩn: `feat:`, `fix:`, `docs:`, `chore:`

### Phạm Vi: 26 FR → Route → DB → Sprint

| Nhóm chức năng | FR IDs | Route Web | Bảng DB | Sprint |
|---|---|---|---|---|
| Đăng nhập & Ca | FR-01→06 | `/login`, `/shift` | `NHAN_VIEN`, `VAI_TRO`, `CA_LAM_VIEC` | 1, 5 |
| Bán hàng & Quét mã | FR-07→12 | `/pos` | `SAN_PHAM`, `CHI_TIET_DON_HANG` | 2 |
| Tính toán & Giá trị | FR-13→16 | `/pos` (cart) | `DON_HANG`, `CHI_TIET_DON_HANG` | 2 |
| Thanh toán | FR-17→20 | `/pos` (payment modal) | `GIAO_DICH`, `PHUONG_THUC_THANH_TOAN` | 3 |
| Hóa đơn & Báo cáo | FR-21→26 | `/orders/[id]`, `/reports` | `HOA_DON`, `DON_HANG` | 3, 4 |

---

### Sprint 0: Project Setup (Cả 3 Dev — 2-3 ngày)

| # | Task | Dev | File chính | Công nghệ | Mô tả |
|---|------|-----|-----------|-----------|-------|
| 0.1 | Tạo Git repository | A | `.gitignore`, `README.md`, `.env.example` | Git, GitHub | Repo, nhánh `main` + `develop`, .gitignore Node |
| 0.2 | Docker Compose | A | `docker-compose.yml` | Docker, PostgreSQL 16 | Container PostgreSQL + pgAdmin local dev |
| 0.3 | Khởi tạo Next.js | B | `frontend/package.json`, `next.config.ts` | Next.js 14, TypeScript | `npx create-next-app@latest`, App Router, Tailwind |
| 0.4 | Cài shadcn/ui + theme | B | `frontend/components/ui/*` | shadcn/ui, Tailwind | `npx shadcn-ui@latest init`, cài Button/Input/Dialog |
| 0.5 | Khởi tạo Express | C | `backend/package.json`, `backend/src/server.ts` | Express, TypeScript | `npm init`, cài express + cors + helmet + dotenv |
| 0.6 | Viết Prisma schema | C | `backend/prisma/schema.prisma` | Prisma | Dịch Physical ERD → schema, chạy `prisma migrate dev` |
| 0.7 | Tạo layout Dashboard | B | `frontend/app/(dashboard)/layout.tsx` | Next.js, Tailwind | Sidebar + Header + Content, nested layout |
| 0.8 | Verify toàn bộ | All | `README.md` | — | Clone → `docker compose up` → `npm run dev` cả FE + BE |

**Kết quả Sprint 0:** Clone → Docker up → `npm run dev` (FE port 3000, BE port 4000) → thấy trang Dashboard trắng với sidebar.

**Checkpoint PDF:** Tuần 10 — Đăng ký đề tài, tạo repo, README khung ✅

---

### Sprint 1: Auth + Product + Customer (Tuần 11)

#### Dev A — Module Authentication
| # | Task | FR | Route | Bảng DB | File chính | Chi tiết |
|---|------|-----|-------|---------|-----------|----------|
| 1.1 | BE: Auth routes + controller | FR-01,03 | `POST /api/auth/login` | `NHAN_VIEN`, `VAI_TRO` | `backend/src/routes/auth.routes.ts`, `controllers/auth.controller.ts` | Login, register, refresh token |
| 1.2 | BE: Auth middleware | FR-03 | — | `NHAN_VIEN` | `backend/src/middleware/auth.middleware.ts` | JWT verify, role-checking middleware |
| 1.3 | FE: NextAuth config | FR-01,03 | — | — | `frontend/lib/auth.ts` | NextAuth.js v5 Credentials provider, JWT strategy |
| 1.4 | FE: Login page | FR-01,02 | `/login` | — | `frontend/app/(auth)/login/page.tsx` | React Hook Form + Zod, error messages, SSR |
| 1.5 | FE: Auth middleware | FR-03 | — | — | `frontend/middleware.ts` | Next.js middleware: redirect nếu chưa login |
| 1.6 | BE: Seed admin + cashier | — | — | `NHAN_VIEN`, `VAI_TRO` | `backend/prisma/seed.ts` | 1 admin + 1 cashier mặc định |

#### Dev B — Module Product
| # | Task | FR | Route | Bảng DB | File chính | Chi tiết |
|---|------|-----|-------|---------|-----------|----------|
| 1.7 | BE: Product CRUD | FR-07,09 | `/api/products` | `SAN_PHAM`, `DANH_MUC` | `controllers/product.controller.ts`, `services/product.service.ts` | CRUD + barcode lookup, Prisma query |
| 1.8 | BE: Category CRUD | — | `/api/categories` | `DANH_MUC` | `controllers/category.controller.ts` | CRUD categories |
| 1.9 | FE: Products page (Admin) | — | `/products` | `SAN_PHAM` | `frontend/app/(dashboard)/products/page.tsx` | DataTable (shadcn), search, filter, SSR |
| 1.10 | FE: Product form dialog | — | `/products` | `SAN_PHAM` | `frontend/components/products/ProductForm.tsx` | Dialog + React Hook Form + Zod validate |

#### Dev C — Module Customer
| # | Task | FR | Route | Bảng DB | File chính | Chi tiết |
|---|------|-----|-------|---------|-----------|----------|
| 1.11 | BE: Customer CRUD | — | `/api/customers` | `KHACH_HANG` | `controllers/customer.controller.ts` | CRUD + search tên/SĐT |
| 1.12 | FE: Customers page | — | `/customers` | `KHACH_HANG` | `frontend/app/(dashboard)/customers/page.tsx` | DataTable, search, pagination |
| 1.13 | FE: Customer form | — | `/customers` | `KHACH_HANG` | `frontend/components/customers/CustomerForm.tsx` | Dialog thêm/sửa KH, Zod validate |
| 1.14 | BE: Seed data | — | — | All | `backend/prisma/seed.ts` | 50 SP, 20 KH, 5 danh mục mẫu |

---

### Sprint 2: POS Screen + Order (Tuần 12)

#### Dev A — POS Screen UI
| # | Task | FR | Route | Bảng DB | File chính | Chi tiết |
|---|------|-----|-------|---------|-----------|----------|
| 2.1 | FE: POS layout | FR-07 | `/pos` | — | `frontend/app/(dashboard)/pos/page.tsx` | Layout 2 cột: trái (grid SP), phải (cart), SSR |
| 2.2 | FE: ProductCard + search | FR-07,08,09 | `/pos` | `SAN_PHAM` | `frontend/components/pos/ProductCard.tsx` | Card click-to-add, barcode input, search |
| 2.3 | FE: Cart sidebar | FR-10,11,12 | `/pos` | `CHI_TIET_DON_HANG` | `frontend/components/cart/CartSidebar.tsx` | +/- SL, xóa item, xóa hết |
| 2.4 | FE: Cart store (Zustand) | FR-13,14,15,16 | — | `DON_HANG` | `frontend/stores/cartStore.ts` | Zustand: auto-calc subtotal/CK/VAT/total |

#### Dev B — Order API Backend
| # | Task | FR | Route | Bảng DB | File chính | Chi tiết |
|---|------|-----|-------|---------|-----------|----------|
| 2.5 | BE: Create Order API | FR-07,10,13 | `POST /api/orders` | `DON_HANG`, `CHI_TIET_DON_HANG` | `controllers/order.controller.ts` | Tạo đơn + items, Prisma transaction |
| 2.6 | BE: Order calc logic | FR-13,14,15,16 | — | `DON_HANG` | `services/order.service.ts` | Tính subtotal, chiết khấu, VAT, total |
| 2.7 | BE: Order validation | FR-09,10 | — | `SAN_PHAM` | `middleware/validate.middleware.ts` | Zod schema validate, SP tồn tại, stock đủ |
| 2.8 | BE: Order status enum | — | — | `DON_HANG` | `prisma/schema.prisma` | PENDING → COMPLETED → CANCELLED |

#### Dev C — Order List & Detail
| # | Task | FR | Route | Bảng DB | File chính | Chi tiết |
|---|------|-----|-------|---------|-----------|----------|
| 2.9 | BE: Get Orders API | FR-16 | `GET /api/orders` | `DON_HANG` | `controllers/order.controller.ts` | List, filter, sort, pagination |
| 2.10 | FE: Orders page | — | `/orders` | `DON_HANG` | `frontend/app/(dashboard)/orders/page.tsx` | DataTable đơn hàng, filter, SSR |
| 2.11 | FE: Order detail (dynamic) | FR-16 | `/orders/[orderId]` | `DON_HANG` | `frontend/app/(dashboard)/orders/[orderId]/page.tsx` | Dynamic route, chi tiết SP/SL/tổng |
| 2.12 | FE: loading + error | — | All | — | `frontend/app/loading.tsx`, `error.tsx` | Skeleton loading, error boundary |

**Checkpoint PDF Sprint 1 (Tuần 12):** Demo 5 phút — DB kết nối, API CRUD ≥2 entity, FE routing + layout ✅

---

### Sprint 3: Payment + Invoice + Nâng cao (Tuần 13)

#### Dev A — Payment UI
| # | Task | FR | Route | Bảng DB | File chính | Chi tiết |
|---|------|-----|-------|---------|-----------|----------|
| 3.1 | FE: Payment dialog | FR-17 | `/pos` | `PHUONG_THUC_THANH_TOAN` | `components/payment/PaymentDialog.tsx` | shadcn Dialog: tổng, chọn PT thanh toán |
| 3.2 | FE: Cash payment | FR-17,18 | `/pos` | — | `components/payment/CashPayment.tsx` | Nhập tiền, tính thối, TT hỗn hợp |
| 3.3 | FE: Mock QR payment | FR-17 | `/pos` | — | `components/payment/QRPayment.tsx` | Hiển thị QR mock VNPay/Momo, xác nhận tự động |
| 3.4 | FE: Customer select | — | `/pos` | `KHACH_HANG` | `components/payment/CustomerSelect.tsx` | Combobox search KH (shadcn) |

#### Dev B — Payment Backend + Nâng cao
| # | Task | FR | Route | Bảng DB | File chính | Chi tiết |
|---|------|-----|-------|---------|-----------|----------|
| 3.5 | BE: Payment API | FR-17,19 | `POST /api/payments` | `GIAO_DICH`, `PHUONG_THUC_THANH_TOAN` | `controllers/payment.controller.ts` | Xử lý thanh toán, lưu giao dịch |
| 3.6 | BE: Prisma transaction | FR-18,19 | — | `DON_HANG`, `GIAO_DICH`, `SAN_PHAM` | `services/payment.service.ts` | `prisma.$transaction()` — atomic commit |
| 3.7 | BE: Socket.io setup | — | — | — | `backend/src/socket.ts` | Socket server, emit events: `low-stock`, `order-update` |
| 3.8 | BE: Cancel/Refund | FR-20 | `PUT /api/orders/:id/cancel` | `DON_HANG`, `GIAO_DICH` | `services/order.service.ts` | Hủy đơn, thử lại thanh toán |

#### Dev C — Invoice + Email
| # | Task | FR | Route | Bảng DB | File chính | Chi tiết |
|---|------|-----|-------|---------|-----------|----------|
| 3.9 | FE: Bill preview | FR-21,22 | `/orders/[orderId]` | `DON_HANG` | `components/invoice/BillPreview.tsx` | Hóa đơn format, nút in/in lại |
| 3.10 | BE: PDF generator | FR-21 | `GET /api/orders/:id/pdf` | `DON_HANG`, `HOA_DON` | `backend/src/utils/pdf.ts` | jsPDF tạo hóa đơn PDF |
| 3.11 | BE: Email service | FR-21 | `POST /api/orders/:id/email` | `KHACH_HANG` | `backend/src/utils/email.ts` | Nodemailer gửi hóa đơn cho KH |
| 3.12 | FE: Order success | FR-19 | `/pos` | — | `components/pos/OrderSuccess.tsx` | Dialog xác nhận, nút "Đơn mới" |

---

### Sprint 4: Reports + Dashboard + Deploy (Tuần 14)

#### Dev A — Dashboard UI
| # | Task | FR | Route | Bảng DB | File chính | Chi tiết |
|---|------|-----|-------|---------|-----------|----------|
| 4.1 | FE: Dashboard page | FR-24 | `/reports` | `DON_HANG`, `GIAO_DICH` | `app/(dashboard)/reports/page.tsx` | Cards doanh thu, số đơn — SSR |
| 4.2 | FE: Sales chart | FR-24 | `/reports` | `DON_HANG` | `components/reports/SalesChart.tsx` | Recharts biểu đồ doanh thu ngày/tuần |
| 4.3 | FE: Top products | FR-24 | `/reports` | `CHI_TIET_DON_HANG` | `components/reports/TopProducts.tsx` | Bảng/chart SP bán chạy |

#### Dev B — Reports Backend + AI
| # | Task | FR | Route | Bảng DB | File chính | Chi tiết |
|---|------|-----|-------|---------|-----------|----------|
| 4.4 | BE: Report APIs | FR-24 | `GET /api/reports/*` | `DON_HANG`, `GIAO_DICH` | `controllers/report.controller.ts` | Daily, period, top-products |
| 4.5 | BE: Export PDF/Excel | FR-25 | `GET /api/reports/export` | `DON_HANG` | `services/report.service.ts` | jsPDF + ExcelJS xuất báo cáo |
| 4.6 | BE: AI suggestions | — | `POST /api/ai/suggest` | `SAN_PHAM` | `backend/src/utils/ai.ts` | Gemini API: gợi ý SP mua kèm, xu hướng |
| 4.7 | FE: AI suggest widget | — | `/pos` | — | `components/pos/AISuggest.tsx` | Hiển thị gợi ý AI bên cạnh cart |

#### Dev C — Deploy + SEO + Settings
| # | Task | FR | Route | Bảng DB | File chính | Chi tiết |
|---|------|-----|-------|---------|-----------|----------|
| 4.8 | Deploy: Vercel (FE) | — | — | — | `vercel.json` | Deploy Next.js, env vars, custom domain |
| 4.9 | Deploy: Render (BE) | — | — | — | `backend/Dockerfile` | Deploy Express, connect Supabase |
| 4.10 | Deploy: Supabase (DB) | — | — | — | `.env.production` | Migrate schema lên cloud |
| 4.11 | FE: SEO metadata | — | All | — | `app/(dashboard)/*/page.tsx` | `generateMetadata()`, `next/image`, OG tags |
| 4.12 | FE: Settings page | — | `/settings` | `NHAN_VIEN` | `app/(dashboard)/settings/page.tsx` | Đổi mật khẩu (Server Action), profile |

**Checkpoint PDF Sprint 2 (Tuần 14):** Link staging hoạt động, auth OK, ≥1 tính năng nâng cao ✅

---

### Sprint 5: Shift + Polish + Testing + Báo cáo (Tuần 15)

#### Dev A — Shift Management (FR-04, 05, 06)
| # | Task | FR | Route | File chính | Chi tiết |
|---|------|-----|-------|-----------|----------|
| 5.1 | FE: Open shift page | FR-04 | `/shift` | `app/(dashboard)/shift/page.tsx` | Nhập số dư đầu ca |
| 5.2 | FE: Close shift dialog | FR-05 | `/shift` | `components/shift/CloseShift.tsx` | Nhập tiền thực tế cuối ca |
| 5.3 | BE: Shift API | FR-04,05,06 | `POST /api/shifts` | `controllers/shift.controller.ts` | Mở/đóng ca, tính chênh lệch |
| 5.4 | FE: Socket.io alerts | — | All | `components/layout/StockAlert.tsx` | Toast cảnh báo tồn kho thấp real-time |

#### Dev B — Testing
| # | Task | FR | Route | File chính | Chi tiết |
|---|------|-----|-------|-----------|----------|
| 5.5 | BE: Unit tests | FR-01→20 | — | `backend/tests/order.test.ts` | Jest ≥5 test cases (order, payment, auth) |
| 5.6 | BE: API integration tests | FR-01→26 | — | `backend/tests/api/*.test.ts` | Supertest test endpoints |
| 5.7 | Fix bugs | — | — | — | Sửa lỗi phát hiện |
| 5.8 | FE: Realtime polish | — | — | `frontend/lib/socket.ts` | Hoàn thiện Socket.io client/server |

#### Dev C — Báo cáo + Slide + Final
| # | Task | FR | Route | File chính | Chi tiết |
|---|------|-----|-------|-----------|----------|
| 5.9 | Viết báo cáo PDF | — | — | `docs/bao-cao.docx` | Theo mẫu PDF: 9 mục (bìa→kết luận) |
| 5.10 | Tạo slide bảo vệ | — | — | `docs/slide.pptx` | 10-15 slide: kiến trúc, demo, phân công |
| 5.11 | FE: Error handling | FR-03,23,26 | All | `app/error.tsx`, `app/not-found.tsx` | Error boundary, toast messages |
| 5.12 | Final verify | FR-01→26 | All | — | E2E: Mở ca → Bán → TT → Đóng ca → Báo cáo |

**Final Submit PDF (Tuần 15):** Upload LMS: báo cáo PDF + slide + link GitHub + link Vercel ✅

---

### Tổng Kết Phân Công

| Dev | Sprint 0 | Sprint 1 | Sprint 2 | Sprint 3 | Sprint 4 | Sprint 5 |
|-----|----------|----------|----------|----------|----------|----------|
| **A** | Git + Docker | Auth (NextAuth) | POS Page + Cart | Payment Dialog | Dashboard + Charts | Shift Module |
| **B** | Next.js + shadcn | Product CRUD | Order API | Payment API + Socket | Reports API + AI | Unit Tests |
| **C** | Express + Prisma | Customer CRUD | Order List + Dynamic Route | Invoice PDF + Email | Deploy + SEO | Báo cáo + Slide |

---

### Ma Trận CRUD: 26 FR × Bảng DB

| FR | Mô tả | NHAN_VIEN | VAI_TRO | CA_LAM_VIEC | SAN_PHAM | DON_HANG | CHI_TIET_DH | GIAO_DICH | PTTT | HOA_DON | KHACH_HANG |
|-----|---------|:---------:|:-------:|:-----------:|:--------:|:--------:|:-----------:|:---------:|:----:|:-------:|:----------:|
| FR-01 | Xác thực online | R | R | | | | | | | | |
| FR-02 | Đăng nhập offline | R | | | | | | | | | |
| FR-03 | Thông báo lỗi/khóa TK | R,U | | | | | | | | | |
| FR-04 | Ghi nhận tiền đầu ca | R | | C | | | | | | | |
| FR-05 | Tổng hợp cuối ca | | | R,U | | R | | R | | | |
| FR-06 | Cảnh báo chênh lệch | | | R,U | | | | R | | | |
| FR-07 | Hiển thị SP khi quét | | | | R | | C | | | | |
| FR-08 | Tăng SL nếu SP đã có | | | | | | U | | | | |
| FR-09 | Gợi ý nhập mã thủ công | | | | R | | | | | | |
| FR-10 | Cập nhật SL/xóa item | | | | | U | U,D | | | | |
| FR-11 | Thêm SP SL lớn | | | | R | | C | | | | |
| FR-12 | Xóa toàn bộ danh sách | | | | | U | D | | | | |
| FR-13 | Tính tổng tiền | | | | R | U | R | | | | |
| FR-14 | Áp dụng chiết khấu | | | | | U | | | | | |
| FR-15 | Tính thuế VAT | | | | R | U | | | | | |
| FR-16 | Hiển thị chi tiết giá | | | | | R | R | | | | |
| FR-17 | Chọn PT thanh toán | | | | | | | | R | | |
| FR-18 | Thanh toán hỗn hợp | | | | | U | | C,C | | | |
| FR-19 | Ghi nhận giao dịch | | | | | U | | C | | | |
| FR-20 | Thử lại khi thất bại | | | | | | | U | | | |
| FR-21 | In hóa đơn | | | | | R | R | | | C | |
| FR-22 | In lại bản sao | | | | | R | R | | | R | |
| FR-23 | Cảnh báo lỗi máy in | | | | | | | | | U | |
| FR-24 | Tổng hợp báo cáo | | | | | R | R | R | | | |
| FR-25 | Xuất file báo cáo | | | | | R | R | R | | | |
| FR-26 | Reload nếu lỗi hiển thị | | | | | R | | R | | | |

> **Chú thích:** C = Create · R = Read · U = Update · D = Delete
