import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import prisma from '../config/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'pos-market-secret-key-change-in-production';
const JWT_EXPIRES_IN = (process.env.JWT_EXPIRES_IN || '8h') as string & SignOptions['expiresIn'];
const JWT_REFRESH_EXPIRES_IN = (process.env.JWT_REFRESH_EXPIRES_IN || '7d') as string & SignOptions['expiresIn'];

export interface LoginInput {
  username: string;
  password: string;
}

export interface TokenPayload {
  userId: number;
  username: string;
  role: string;
}

export class AuthService {
  /**
   * Xác thực người dùng bằng username + password
   * FR-01: Xác thực online
   */
  async login(input: LoginInput) {
    const { username, password } = input;

    // Tìm nhân viên theo username, include role
    const nhanVien = await prisma.nhanVien.findUnique({
      where: { username },
      include: { role: true },
    });

    if (!nhanVien) {
      throw new Error('Tên đăng nhập hoặc mật khẩu không đúng');
    }

    // Verify password bằng bcrypt
    const isValidPassword = await bcrypt.compare(password, nhanVien.password);
    if (!isValidPassword) {
      throw new Error('Tên đăng nhập hoặc mật khẩu không đúng');
    }

    // Tạo JWT tokens
    const payload: TokenPayload = {
      userId: nhanVien.id,
      username: nhanVien.username,
      role: nhanVien.role.name,
    };

    const accessToken = jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    } as SignOptions);

    const refreshToken = jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_REFRESH_EXPIRES_IN,
    } as SignOptions);

    return {
      accessToken,
      refreshToken,
      user: {
        id: nhanVien.id,
        username: nhanVien.username,
        fullName: nhanVien.fullName,
        role: nhanVien.role.name,
      },
    };
  }

  /**
   * Verify và decode JWT token
   */
  verifyToken(token: string): TokenPayload {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshTokenStr: string) {
    const payload = this.verifyToken(refreshTokenStr);

    // Kiểm tra user vẫn tồn tại
    const nhanVien = await prisma.nhanVien.findUnique({
      where: { id: payload.userId },
      include: { role: true },
    });

    if (!nhanVien) {
      throw new Error('Người dùng không tồn tại');
    }

    const newPayload: TokenPayload = {
      userId: nhanVien.id,
      username: nhanVien.username,
      role: nhanVien.role.name,
    };

    const accessToken = jwt.sign(newPayload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    } as SignOptions);

    return { accessToken };
  }
}

export const authService = new AuthService();
