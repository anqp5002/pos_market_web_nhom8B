import { describe, it, expect, beforeAll, jest } from '@jest/globals';
import request from "supertest";
import app from "../src/server"; // Khởi tạo app (Supertest sẽ dùng app này)
import prisma from "../src/config/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// ==========================================
// MOCK PRISMA & BCRYPT
// Yêu cầu (Hạng mục #10): Unit Test cho API
// ==========================================

// Mock prisma client để không chạm vào Database thật
jest.mock("../src/config/prisma", () => ({
  __esModule: true,
  default: {
    nhanVien: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
    },
    sanPham: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
  },
}));

// Mock bcrypt
jest.mock("bcryptjs", () => ({
  compare: jest.fn(),
}));

let token = "";

beforeAll(() => {
  // Tạo 1 token giả lập (Admin) để bypass authMiddleware
  token = jwt.sign(
    { userId: 1, role: "Admin", username: "admin" },
    process.env.JWT_SECRET || "fallback_secret",
    { expiresIn: "1h" }
  );
});

describe("POS Market API - Unit Tests", () => {

  // 1. POST /api/auth/login (Đúng tài khoản)
  it("1. [POST] /api/auth/login - Đăng nhập thành công trả về 200 + token", async () => {
    // Giả lập tìm thấy user
    (prisma.nhanVien.findUnique as jest.Mock<any>).mockResolvedValue({
      id: 1,
      username: "admin",
      password: "hashedpassword",
      role: { name: "Admin" },
    });
    // Giả lập đúng password
    (bcrypt.compare as jest.Mock<any>).mockResolvedValue(true);

    const res = await request(app).post("/api/auth/login").send({
      username: "admin",
      password: "password123",
    });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("token");
    expect(res.body.user).toHaveProperty("username", "admin");
  });

  // 2. POST /api/auth/login (Sai mật khẩu)
  it("2. [POST] /api/auth/login - Đăng nhập sai mật khẩu trả về 401", async () => {
    (prisma.nhanVien.findUnique as jest.Mock<any>).mockResolvedValue({
      id: 1,
      username: "admin",
      password: "hashedpassword",
      role: { name: "Admin" },
    });
    // Giả lập sai password
    (bcrypt.compare as jest.Mock<any>).mockResolvedValue(false);

    const res = await request(app).post("/api/auth/login").send({
      username: "admin",
      password: "wrongpassword",
    });

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty("error", "Sai mật khẩu");
  });

  // 3. GET /api/products
  it("3. [GET] /api/products - Lấy danh sách sản phẩm thành công", async () => {
    // Giả lập DB trả về danh sách sản phẩm
    (prisma.sanPham.findMany as jest.Mock<any>).mockResolvedValue([
      { id: 1, name: "Sản phẩm A", price: 100 },
      { id: 2, name: "Sản phẩm B", price: 200 },
    ]);

    const res = await request(app)
      .get("/api/products")
      .set("Authorization", `Bearer ${token}`); // Cần token vì là Protected Route

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("data");
    expect(Array.isArray(res.body.data)).toBeTruthy();
    expect(res.body.data.length).toBe(2);
  });

  // 4. POST /api/products (Thiếu trường name)
  it("4. [POST] /api/products - Báo lỗi 400 do thiếu trường bắt buộc", async () => {
    const res = await request(app)
      .post("/api/products")
      .set("Authorization", `Bearer ${token}`)
      .send({
        // Cố tình thiếu name, barcode, price (Các trường bắt buộc)
        stock: 10,
      });

    // Theo setup Zod validator, thiếu data sẽ văng lỗi 400
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
  });

  // 5. DELETE /api/employees/:id (Xóa Admin chính mình)
  it("5. [DELETE] /api/employees/:id - Không cho phép Admin tự xóa chính mình", async () => {
    // Test logic bảo vệ: Admin (userId=1 từ token) gọi xóa ID=1
    const res = await request(app)
      .delete("/api/employees/1")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/Không thể tự xóa chính mình/i);
  });

});
