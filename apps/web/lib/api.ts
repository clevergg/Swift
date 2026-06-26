// Обёртка для запросов к API. Запросы идут на /api/* (тот же origin),
// Next.js проксирует их на NestJS (см. rewrites в next.config.js).
//
// #16: автоматическая подстановка access-токена и обработка 401 (refresh).
// Чтобы НЕ создавать циклический импорт с auth-store, api НЕ импортирует стор.
// Вместо этого стор регистрирует здесь свои функции (см. configureAuth ниже) —
// это инверсия зависимости: api ничего не знает про стор, стор зависит от api.

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

// --- Мост к auth-store (заполняется стором через configureAuth) ---

interface AuthBridge {
  // Текущий access-токен (или null).
  getAccessToken: () => string | null;
  // Сохранить новый токен после refresh.
  setAccessToken: (token: string) => void;
  // Полный разлогин (refresh не удался) — стор сбрасывает состояние.
  onAuthFailure: () => void;
}

// По умолчанию — заглушки (до регистрации стором). Так api работает даже
// если стор ещё не сконфигурирован (например, на самом первом рендере).
let authBridge: AuthBridge = {
  getAccessToken: () => null,
  setAccessToken: () => {},
  onAuthFailure: () => {},
};

// Стор вызывает это один раз при инициализации, передавая свои функции.
export function configureAuth(bridge: AuthBridge): void {
  authBridge = bridge;
}

// --- Single-flight refresh (дедупликация) ---

// Promise текущего refresh. Пока он не null — refresh уже идёт, и параллельные
// 401-запросы ждут ЕГО, а не запускают новый. Это предотвращает гонку,
// которая при ротации refresh-токенов (с детектом кражи) выкинула бы юзера.
let refreshPromise: Promise<string> | null = null;

async function doRefresh(): Promise<string> {
  // Если refresh уже идёт — возвращаем тот же promise (ждём общий результат).
  if (refreshPromise) {
    return refreshPromise;
  }

  // Запускаем refresh и сохраняем promise, чтобы параллельные запросы ждали его.
  refreshPromise = (async (): Promise<string> => {
    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      credentials: 'include', // refresh-токен в httpOnly cookie
    });
    if (!response.ok) {
      throw new ApiException(response.status, {
        code: 'REFRESH_FAILED',
        message: 'Не удалось обновить сессию',
      });
    }
    const data = (await response.json()) as { accessToken: string };
    authBridge.setAccessToken(data.accessToken);
    return data.accessToken;
  })();

  try {
    return await refreshPromise;
  } finally {
    // Сбрасываем — следующий 401 (когда токен снова протухнет) запустит новый.
    refreshPromise = null;
  }
}

// --- Основная функция запроса ---

interface RequestOptions {
  method?: string;
  body?: unknown;
  // skipAuth — не подставлять токен и не пытаться refresh (для самих auth-роутов).
  skipAuth?: boolean;
  // _retry — внутренний флаг: запрос уже повторялся после refresh (защита от цикла).
  _retry?: boolean;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, skipAuth = false, _retry = false } = options;

  const headers: Record<string, string> = {};
  if (body) {
    headers['Content-Type'] = 'application/json';
  }
  // Автоподстановка access-токена (если есть и не skipAuth).
  if (!skipAuth) {
    const token = authBridge.getAccessToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const response = await fetch(`/api${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    credentials: 'include',
  });

  // 401 + не auth-роут + ещё не повторяли → пробуем refresh и повторяем запрос.
  if (response.status === 401 && !skipAuth && !_retry) {
    try {
      await doRefresh(); // дедуплицированный refresh
    } catch {
      // refresh не удался — сессия мертва, разлогиниваем.
      authBridge.onAuthFailure();
      throw new ApiException(401, {
        code: 'UNAUTHORIZED',
        message: 'Сессия истекла',
      });
    }
    // Повторяем исходный запрос с новым токеном (_retry: true — больше не зациклимся).
    return request<T>(path, { ...options, _retry: true });
  }

  if (!response.ok) {
    let errBody: ApiError;
    try {
      errBody = (await response.json()) as ApiError;
    } catch {
      errBody = { code: 'UNKNOWN', message: response.statusText };
    }
    throw new ApiException(response.status, errBody);
  }

  if (response.status === 204) {
    return undefined as T;
  }
  return (await response.json()) as T;
}

// skipAuth-обёртки для auth-роутов (login/register/refresh/logout не должны
// триггерить авто-refresh и подстановку токена).
export const api = {
  get: <T>(path: string, opts?: { skipAuth?: boolean }): Promise<T> =>
    request<T>(path, { skipAuth: opts?.skipAuth }),
  post: <T>(path: string, body?: unknown, opts?: { skipAuth?: boolean }): Promise<T> =>
    request<T>(path, { method: 'POST', body, skipAuth: opts?.skipAuth }),
  patch: <T>(path: string, body?: unknown, opts?: { skipAuth?: boolean }): Promise<T> =>
    request<T>(path, { method: 'PATCH', body, skipAuth: opts?.skipAuth }),
  delete: <T>(path: string, opts?: { skipAuth?: boolean }): Promise<T> =>
    request<T>(path, { method: 'DELETE', skipAuth: opts?.skipAuth }),
};
