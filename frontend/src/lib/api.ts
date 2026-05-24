import { auth } from '@/lib/auth';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

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

  const { headers, ...restOptions } = fetchOptions;

  const res = await fetch(url, {
    ...restOptions,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  });

  // Ghi log request payload để debug
  if (url.includes('/products') && ['POST', 'PUT'].includes(fetchOptions.method || '')) {
    console.log(`[DEBUG API] ${fetchOptions.method} ${url}`, fetchOptions.body);
  }

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Lỗi không xác định' }));
    console.error(`[DEBUG API ERROR]`, error);
    throw new Error(error.message || error.error || `HTTP Error ${res.status}`);
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
