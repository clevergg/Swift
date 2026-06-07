// Обёртка для запросов к API. Запросы идут на /api/* (тот же origin),
// Next.js проксирует их на NestJS (см. rewrites в next.config.js).
//
// Пока базовая версия. В #16 добавим автоматическую подстановку
// access-токена из стора auth и обработку 401 (refresh).

interface ApiError {
  code: string;
  message: string;
  details?: unknown;
}

export class ApiException extends Error {
  constructor(
    public status: number,
    public error: ApiError,
  ) {
    super(error.message);
    this.name = 'ApiException';
  }
}

interface RequestOptions {
  method?: string;
  body?: unknown;
  // token - access-токен (в #16 будет подставляться автоматически из стора).
  token?: string;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, token } = options;

  const headers: Record<string, string> = {};
  if (body) {
    headers['Content-Type'] = 'application/json';
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`/api${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    // credentials: include - чтобы httpOnly cookie (refresh) отправлялись.
    credentials: 'include',
  });

  if (!response.ok) {
    let errBody: ApiError;
    try {
      errBody = (await response.json()) as ApiError;
    } catch {
      errBody = { code: 'UNKNOWN', message: response.statusText };
    }
    throw new ApiException(response.status, errBody);
  }

  // 204 No Content - тела нет.
  if (response.status === 204) {
    return undefined as T;
  }
  return (await response.json()) as T;
}

export const api = {
  get: <T>(path: string, token?: string): Promise<T> => request<T>(path, { token }),
  post: <T>(path: string, body?: unknown, token?: string): Promise<T> =>
    request<T>(path, { method: 'POST', body, token }),
  patch: <T>(path: string, body?: unknown, token?: string): Promise<T> =>
    request<T>(path, { method: 'PATCH', body, token }),
  delete: <T>(path: string, token?: string): Promise<T> =>
    request<T>(path, { method: 'DELETE', token }),
};
