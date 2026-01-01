import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { COOKIE_KEYS } from '@/constants/cookies';
import { ROUTES } from '@/constants/routes';

export function middleware(req: NextRequest) {
  const token = req.cookies.get(COOKIE_KEYS.AUTH_TOKEN)?.value;
  const { pathname } = req.nextUrl;

  if (token && pathname === ROUTES.LOGIN) {
    return NextResponse.redirect(new URL(ROUTES.ADMIN.DASHBOARD, req.url));
  }

  if (!token && pathname !== ROUTES.LOGIN) {
    return NextResponse.redirect(new URL(ROUTES.LOGIN, req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/', '/login', '/admin/:path*',
  ],
};
