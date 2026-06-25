import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Серверная отсечка по флагу has_session (грубый быстрый фильтр).
// Видит только НАЛИЧИЕ флага, не валидность сессии — точную проверку
// (протух/отозван refresh) делает клиентский guard. Это первый из двух слоёв.

// Гостевые роуты — для незалогиненных. Залогиненного отсюда уводим.
const GUEST_ROUTES = ['/login', '/register'];

// Куда вести залогиненного по умолчанию (пока — заглушка дашборда).
// В #17 здесь будет реальный путь к доскам/дашборду.
const DEFAULT_PRIVATE_ROUTE = '/dashboard';

export function middleware(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;
  const hasSession = request.cookies.has('has_session');

  const isGuestRoute = GUEST_ROUTES.some((route) => pathname.startsWith(route));

  // Гостевой роут + есть сессия → на дашборд (нечего делать на /login).
  if (isGuestRoute && hasSession) {
    return NextResponse.redirect(new URL(DEFAULT_PRIVATE_ROUTE, request.url));
  }

  // Гостевой роут без сессии → пропускаем (показываем форму).
  if (isGuestRoute) {
    return NextResponse.next();
  }

  // Корень → редирект по наличию сессии.
  if (pathname === '/') {
    return NextResponse.redirect(
      new URL(hasSession ? DEFAULT_PRIVATE_ROUTE : '/login', request.url),
    );
  }

  // Остальное (приватные роуты) без сессии → на /login.
  if (!hasSession) {
    const loginUrl = new URL('/login', request.url);
    // Запомним, куда юзер шёл — после входа вернём туда (в #17 можно использовать).
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Приватный роут + есть сессия → пропускаем (guard дальше проверит валидность).
  return NextResponse.next();
}

// Matcher — на какие пути запускать middleware. Исключаем статику, картинки,
// API (у API своя auth через JWT, middleware ему не нужен).
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};
