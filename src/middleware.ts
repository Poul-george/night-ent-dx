import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const userId = request.cookies.get('userId')
  const isLoginPage = request.nextUrl.pathname === '/'
  const isDashboardPage = request.nextUrl.pathname.startsWith('/dashboard')

  // ログイン済みユーザーがログインページにアクセスした場合
  if (isLoginPage && userId) {
    return NextResponse.redirect(new URL('/dashboard/home', request.url))
  }

  // 未ログインユーザーがダッシュボードにアクセスした場合
  if (isDashboardPage && !userId) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

// ミドルウェアを適用するパスを指定
export const config = {
  matcher: ['/', '/dashboard/:path*']
} 