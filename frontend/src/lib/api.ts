const getApiBase = () => {
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    return `http://${host}:4000/api`;
  }
  // Server-side: Always use localhost for absolute reliability on the host machine
  return 'http://localhost:4000/api';
};
const API_BASE = getApiBase();

interface FetchOptions extends RequestInit {
  params?: Record<string, string | number | undefined>;
}

// Helper function để gọi API backend
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

  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...fetchOptions.headers,
    },
    ...fetchOptions,
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
