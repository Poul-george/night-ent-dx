import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('userId')

    if (!userId) {
      // Cookieが存在しない場合、既存のCookieを削除
      cookieStore.delete('userId')
      cookieStore.delete('loginTime')
      
      return NextResponse.json(
        { error: 'Not authenticated' }, 
        { status: 401 }
      )
    }

    // userIdが存在する場合はそのまま返す
    return NextResponse.json({ userId: userId.value })
    
  } catch (error) {
    console.error('Session error:', error)
    // エラー時もCookieを削除
    const cookieStore = await cookies()
    cookieStore.delete('userId')
    cookieStore.delete('loginTime')
    
    return NextResponse.json(
      { error: 'Internal Server Error' }, 
      { status: 500 }
    )
  }
} 