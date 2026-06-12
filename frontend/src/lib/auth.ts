import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          const res = await fetch(`${API_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              username: credentials?.username,
              password: credentials?.password,
            }),
          });

          const data = await res.json();

          if (!res.ok || !data.success) {
            throw new Error(data.message || "Đăng nhập thất bại");
          }

          // Trả về user object cho NextAuth session
          return {
            id: String(data.data.user.id),
            name: data.data.user.fullName,
            email: data.data.user.username,
            accessToken: data.data.accessToken,
            refreshToken: data.data.refreshToken,
            role: data.data.user.role,
          };
        } catch (error: any) {
          throw new Error(error.message || "Đăng nhập thất bại");
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // Lần đầu login: gắn thông tin user vào token
      if (user) {
        token.accessToken = (user as any).accessToken;
        token.refreshToken = (user as any).refreshToken;
        token.role = (user as any).role;
        token.userId = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      // Truyền thông tin từ token vào session
      (session as any).accessToken = token.accessToken;
      (session as any).user.role = token.role;
      (session as any).user.id = token.userId;
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 8 * 60 * 60, // 8 giờ
  },
  secret: process.env.NEXTAUTH_SECRET || "pos-market-secret",
});
