import { auth } from '@/lib/auth';

/**
 * Xác định API URL động: client-side dùng hostname (hỗ trợ LAN),
 * server-side dùng localhost (loopback tin cậy).
 */
export const getApiBase = () => {
  // Production (Vercel): Luôn dùng biến môi trường đã cấu hình trên Dashboard
  if (process.env.NODE_ENV === 'production') {
    return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
  }

  // Development Client-side (Trình duyệt/Điện thoại): Lấy IP động để hỗ trợ test qua mạng LAN
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    return `http://${host}:4000/api`;
  }
  
  // Development Server-side: Luôn dùng localhost để đảm bảo độ ổn định
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
};

interface FetchOptions extends RequestInit {
  params?: Record<string, string | number | undefined>;
}

/**
 * Helper function để gọi API backend (không cần token)
 */
export async function apiFetch<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const { params, ...fetchOptions } = options;
  const API_BASE = getApiBase();

  let url = `${API_BASE}${endpoint}`;

  // Thêm query params
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
  }

  const { headers: customHeaders, ...restOptions } = fetchOptions;

  const isFormData = restOptions.body instanceof FormData;
  const defaultHeaders: Record<string, string> = isFormData ? {} : { 'Content-Type': 'application/json' };

  const res = await fetch(url, {
    ...restOptions,
    headers: {
      ...defaultHeaders,
      ...customHeaders,
    },
  });

  if (!res.ok) {
    let errorMessage = `HTTP Error ${res.status}`;
    try {
      const errorData = await res.json();
      errorMessage = errorData.error || errorData.message || errorMessage;
    } catch {
      try {
        const text = await res.text();
        errorMessage = `HTTP ${res.status}: ${text.slice(0, 150)}`;
      } catch {}
    }
    throw new Error(errorMessage);
  }

  return res.json();
}

/**
 * Helper function để gọi API backend CÓ JWT token (Server-side)
 * Tự động lấy accessToken từ NextAuth session và gắn vào header
 * FR-01: Bảo vệ API bằng JWT
 */
export async function authFetch<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  // Lấy session từ NextAuth (server-side)
  const session = await auth();
  const token = (session as any)?.accessToken;

  return apiFetch<T>(endpoint, {
    ...options,
    headers: {
      ...options.headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
}

/**
 * Lấy accessToken từ session (dùng cho Client Component)
 * Gọi NextAuth API route /api/auth/session từ client
 */
export async function getClientToken(): Promise<string | null> {
  try {
    const res = await fetch('/api/auth/session');
    const session = await res.json();
    return session?.accessToken || null;
  } catch {
    return null;
  }
}
