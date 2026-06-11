"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { loginSchema, type LoginFormData } from "@/lib/validators";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setError(null);
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        username: data.username,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        setError("Tên đăng nhập hoặc mật khẩu không đúng");
      } else {
        router.push("/pos");
        router.refresh();
      }
    } catch {
      setError("Có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md px-4">
      {/* Logo */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4 shadow-lg shadow-blue-200">
          <svg
            className="w-8 h-8 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-800">POS Market</h1>
        <p className="text-gray-500 text-sm mt-1">
          Hệ thống bán hàng siêu thị
        </p>
      </div>

      {/* Login Card */}
      <Card className="border-gray-200 bg-white shadow-xl shadow-gray-200/50">
        <CardHeader className="space-y-1 pb-4">
          <CardTitle className="text-xl text-gray-800">Đăng nhập</CardTitle>
          <CardDescription className="text-gray-500">
            Nhập thông tin tài khoản để truy cập hệ thống
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Error Alert */}
            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm flex items-center gap-2">
                <svg
                  className="w-4 h-4 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                {error}
              </div>
            )}

            {/* Username */}
            <div className="space-y-2">
              <Label htmlFor="username" className="text-gray-700">
                Tên đăng nhập
              </Label>
              <Input
                id="username"
                type="text"
                placeholder="admin"
                className="bg-gray-50 border-gray-200 text-gray-800 placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-500/20"
                {...register("username")}
                disabled={isLoading}
              />
              {errors.username && (
                <p className="text-red-500 text-xs">{errors.username.message}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-700">
                Mật khẩu
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••"
                className="bg-gray-50 border-gray-200 text-gray-800 placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-500/20"
                {...register("password")}
                disabled={isLoading}
              />
              {errors.password && (
                <p className="text-red-500 text-xs">{errors.password.message}</p>
              )}
            </div>

            {/* Submit */}
            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium h-11 transition-all duration-200 shadow-md shadow-blue-200 hover:shadow-blue-300"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg
                    className="animate-spin w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Đang xử lý...
                </span>
              ) : (
                "Đăng nhập"
              )}
            </Button>

            {/* Demo accounts */}
            <div className="pt-3 border-t border-gray-100">
              <p className="text-xs text-gray-400 text-center mb-2">
                Tài khoản demo
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-blue-50 text-blue-700 rounded-lg p-2.5 text-center border border-blue-100">
                  <span className="font-semibold">admin</span>
                  <span className="text-blue-400"> / 123456</span>
                </div>
                <div className="bg-emerald-50 text-emerald-700 rounded-lg p-2.5 text-center border border-emerald-100">
                  <span className="font-semibold">cashier01</span>
                  <span className="text-emerald-400"> / 123456</span>
                </div>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Footer */}
      <p className="text-center text-xs text-gray-400 mt-6">
        POS Market © 2026 — Nhóm 8B INT1334
      </p>
    </div>
  );
}
