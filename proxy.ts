import { NextRequest, NextResponse } from 'next/server'

//需要登陆才能访问的路由列表
const PROTECTED_ROUTES = ['/dashboard', '/practice', '/volunteers', '/resume', '/resume-ai', '/companies', '/help', '/feedback']

export function proxy(req: NextRequest) {
   // 从 cookie 中读取登录凭证（支持 NUID 或 邮箱 两种登录方式）
  const nuid = req.cookies.get('nuid')?.value
  const email = req.cookies.get('email')?.value
  // 只要有任意一个凭证就视为已登录
  const isLoggedIn = !!(nuid || email)
  const path = req.nextUrl.pathname

  const isProtected = PROTECTED_ROUTES.some(route => path.startsWith(route))

  // 场景1：未登录用户访问受保护页面 → 重定向到登录页
  // 同时把原目标路径存入 ?from= 参数，登录后可跳回原页面
  if (isProtected && !isLoggedIn) {
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('from', path)
    return NextResponse.redirect(loginUrl)
  }
  // 场景2：已登录用户访问登录/注册页 → 重定向到首页（防止重复登录）
  if (isLoggedIn && (path === '/login' || path === '/signup')) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/practice/:path*', '/volunteers/:path*', '/resume/:path*', '/resume-ai/:path*', '/companies/:path*', '/help/:path*', '/feedback/:path*', '/login', '/signup'],
}

