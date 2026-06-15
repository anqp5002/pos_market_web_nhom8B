# POS Market - He Thong Quan Ly Ban Hang Sieu Thi Thong Minh

Do an cuoi ky mon hoc INT1334 - Lap Trinh Web
Giang vien huong dan: ThS. Le Ngoc Hieu
Nhom thuc hien: Nhom 8B

-------------------------------------------------------------------------------
1. GIOI THIEU TONG QUAN
-------------------------------------------------------------------------------
POS Market la mot he thong phan mem quan ly diem ban hang (Point of Sale) toan
dien, duoc thiet ke theo kien truc Client-Server hien dai. Du an huong toi viec
so hoa quy trinh ban le cho cac sieu thi va cua hang tien loi, giup toi uu hoa
trai nghiem cua nhan vien thu ngan cung nhu ho tro quan ly hang hoa mot cach 
chat che, han che that thoat thong qua viec ket hop cac cong nghe tien tien nhat
bao gom Tri tue nhan tao (AI Chatbot) va Kien truc Ung dung Web Tien tien (PWA).

Du an duoc xay dung voi muc tieu ap dung thuc te cac kien thuc da hoc trong 
mon Lap Trinh Web vao mot bai toan thuc te cua doanh nghiep.

-------------------------------------------------------------------------------
2. KIEN TRUC CONG NGHE (TECH STACK)
-------------------------------------------------------------------------------
He thong duoc xay dung dua tren kien truc Micro-services thu nhat voi su phan
tach ro rang giua Frontend va Backend.

* Frontend:
  - Framework: Next.js 16 (App Router, Server Actions, Turbopack).
  - Ngon ngu: TypeScript strict mode.
  - State Management: Zustand (quan ly state gio hang cuc bo hieu qua).
  - Quan ly Form & Validate: React Hook Form ket hop Zod.
  - UI/UX Styling: Tailwind CSS va Shadcn UI.
  - Hieu nang: Tich hop Progressive Web App (PWA) cho phep cai dat va cache offline.

* Backend:
  - Framework: Node.js voi Express.js.
  - Ngon ngu: TypeScript.
  - ORM (Object-Relational Mapping): Prisma ORM.
  - Co so du lieu: PostgreSQL.
  - Bao mat (Authentication & Authorization): JSON Web Token (JWT) va Bcrypt.
  - Tien ich thu 3: Nodemailer (gui email hoa don), Multer (upload hinh anh).

* Tri tue nhan tao (AI):
  - Model: Google Gemini 2.5 Flash API.
  - Ung dung: Chatbot ho tro nguoi dung va He thong goi y ban cheo (Cross-selling).

* Trien khai (Deployment) & DevOps:
  - Containerization: Docker va Docker Compose (quan ly co so du lieu).
  - Hosting Frontend: Vercel.
  - Hosting Backend: Render.

-------------------------------------------------------------------------------
3. MO TA CHUC NANG CHI TIET
-------------------------------------------------------------------------------
3.1. Chuc nang Ban hang (POS Core)
  - Giao dien ban hang (Cashier Interface) duoc thiet ke toi uu cho toc do thao tac.
  - Tinh toan thoi gian thuc tong tien gio hang, bao gom Thue VAT va Tien thoi lai.
  - Cho phep quet ma vach (Barcode) de them nhanh san pham vao gio.
  - Xuat hoa don duoi dinh dang PDF, hoac gui truc tiep Hoa don dien tu qua Email.

3.2. Quan ly Kho hang va San pham
  - Phan loai san pham theo danh muc (Categories).
  - Kiem soat chat che so luong ton kho (Stock Tracking).
  - He thong tu dong phat canh bao het hang va khoa chuc nang thanh toan khi ton kho
    cham muc 0 nham tranh tinh trang am kho.

3.3. Quan ly Ca lam viec (Shift Management)
  - Nhan vien thu ngan bat buoc phai Mo ca (Open Shift) va xac nhan so tien ban
    dau ca truoc khi thuc hien bat ky giao dich nao.
  - Dong ca (Close Shift) cuoi ngay de he thong tu dong doi soat doanh thu ly
    thuyet va tien mat thuc te thu duoc, phat hien chenh lech neu co.

3.4. Tro ly ao Tri tue Nhan tao (AI Chatbot)
  - Tich hop truc tiep API cua Google Gemini 2.5 Flash.
  - Giai dap tu dong cac thac mac ve cach su dung phan mem.
  - Tu dong phan tich gio hang hien tai va dua ra 3 goi y san pham mua kem
    nham tang gia tri don hang (Cross-selling).

3.5. Bao mat va Phan quyen
  - Phan quyen dua tren Role-based Access Control (RBAC).
  - Role Admin: Toan quyen quan tri nhan su, kho hang, xem thong ke doanh thu.
  - Role Cashier: Chi co quyen ban hang, giao ca va xem lich su don hang cua ban than.
  - Middleware bao ve xuyen suot toan bo cac API Endpoint quan trong.

-------------------------------------------------------------------------------
4. HUONG DAN CAI DAT VA KHOI CHAY TAI LOCAL
-------------------------------------------------------------------------------
Yeu cau kien quyet: May tinh can cai dat san Node.js (phien ban 18 tro len) 
va Docker Desktop (hoac PostgreSQL chay o cong 5432).

BUOC 1: Khoi dong Co so du lieu PostgreSQL (Thong qua Docker)
Tu thu muc goc cua du an, thuc thi lenh:
  docker-compose up -d

BUOC 2: Cau hinh va khoi chay Backend
  cd backend
  npm install

  - Sao chep noi dung tu file .env.example (o thu muc goc) vao file .env trong backend.
  - Dam bao cac key JWT_SECRET va GEMINI_API_KEY da duoc dien day du.

  - Thiet lap co so du lieu va nap du lieu mau (Seed Data):
    npx prisma generate
    npx prisma db push
    npm run seed

  - Khoi chay Server:
    npm run dev
    (Server backend se hoat dong tai: http://localhost:4000)

BUOC 3: Cau hinh va khoi chay Frontend
  Mo mot cua so Terminal khac:
  cd frontend
  npm install

  - Tao file .env.local trong thu muc frontend va dien NEXT_PUBLIC_API_URL.
  - Khoi chay Server Frontend:
    npm run dev
    (Giao dien website se hoat dong tai: http://localhost:3000)

-------------------------------------------------------------------------------
5. TAI KHOAN KIEM THU (TESTING ACCOUNTS)
-------------------------------------------------------------------------------
He thong da duoc nap san cac tai khoan duoi day sau khi chay lenh seed:

- Tai khoan Quan tri (Admin):
  Username: admin
  Password: password123

- Tai khoan Thu ngan (Cashier):
  Username: cashier1
  Password: password123

-------------------------------------------------------------------------------
6. GIAY PHEP SU DUNG (LICENSE)
-------------------------------------------------------------------------------
Ma nguon nay duoc phat trien hoan toan vi muc dich hoc thuat va nghien cuu 
de dap ung cac yeu cau cua mon hoc Lap trinh Web (INT1334).
Nghiem cam su dung du an nay cho bat ky muc dich thuong mai nao khi chua co 
su dong y bang van ban tu nhom tac gia.
