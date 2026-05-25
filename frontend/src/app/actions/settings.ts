"use server";

import { auth } from "@/lib/auth";
import { apiFetch } from "@/lib/api";

export interface ChangePasswordState {
  success?: boolean;
  message?: string;
  errors?: {
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
  };
}

/**
 * Server Action xử lý đổi mật khẩu nhân viên một cách bảo mật
 */
export async function changePasswordAction(
  prevState: ChangePasswordState | null,
  formData: FormData
): Promise<ChangePasswordState> {
  try {
    const session = await auth();
    const accessToken = (session as any)?.accessToken;

    if (!session || !accessToken) {
      return {
        success: false,
        message: "Phiên làm việc hết hạn hoặc bạn chưa đăng nhập.",
      };
    }

    const currentPassword = formData.get("currentPassword") as string;
    const newPassword = formData.get("newPassword") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    const errors: ChangePasswordState["errors"] = {};

    if (!currentPassword) {
      errors.currentPassword = "Vui lòng nhập mật khẩu hiện tại";
    }
    if (!newPassword) {
      errors.newPassword = "Vui lòng nhập mật khẩu mới";
    } else if (newPassword.length < 6) {
      errors.newPassword = "Mật khẩu mới phải từ 6 ký tự trở lên";
    }
    if (!confirmPassword) {
      errors.confirmPassword = "Vui lòng xác nhận mật khẩu mới";
    } else if (newPassword !== confirmPassword) {
      errors.confirmPassword = "Xác nhận mật khẩu không khớp";
    }

    if (Object.keys(errors).length > 0) {
      return {
        success: false,
        message: "Vui lòng kiểm tra lại thông tin nhập vào.",
        errors,
      };
    }

    // Gọi API đổi mật khẩu Backend Express
    const response = await apiFetch<{ success: boolean; message?: string }>(
      "/auth/change-password",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      }
    );

    if (response.success) {
      return {
        success: true,
        message: "Đổi mật khẩu thành công!",
      };
    }

    return {
      success: false,
      message: response.message || "Đổi mật khẩu thất bại.",
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Đã xảy ra lỗi kết nối tới máy chủ.",
    };
  }
}
