# Web POS - PTIT HCM
Dự án điểm danh hệ thống POS siêu thị.

## Yêu cầu môi trường
- Node.js 18+
- Docker Desktop (cho PostgreSQL)

## Khởi chạy dự án
1. Copy `.env.example` thành `.env` ở cả thư mục `frontend/` và `backend/`.
2. Khởi chạy Database:
   ```bash
   docker compose up -d
   ```
3. Chạy Backend:
   ```bash
   cd backend
   npm install
   npx prisma migrate dev
   npm run dev
   ```
4. Chạy Frontend:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
