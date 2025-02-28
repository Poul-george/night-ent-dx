import { prisma } from '@/client/db'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import bcrypt from 'bcryptjs'
import { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    const user = await prisma.user.findFirst({
      where: {
        email: email,
      },
      select: {
        id: true,
        storeId: true,
        password: true,
      },
    })

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    const cookieStore = await cookies();

    function setCookie(cookieStore: ReadonlyRequestCookies, name: string, iValue: number, sValue: string) {
      const value = iValue ? String(iValue) : sValue;
      cookieStore.set(name, String(value), {
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 // 24 hours
      });
    }

    // Set cookies
    setCookie(cookieStore, 'userId', user.id, "");
    setCookie(cookieStore, 'storeId', user.storeId, "");
    setCookie(cookieStore, 'loginTime', 0, new Date().toISOString());

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
} 