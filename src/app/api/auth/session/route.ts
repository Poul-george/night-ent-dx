import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('userId')
    const storeId = cookieStore.get('storeId')

    if (!userId || !storeId) {
      // Cookieが存在しない場合、既存のCookieを削除
      cookieStore.delete('userId')
      cookieStore.delete('storeId')
      cookieStore.delete('loginTime')
      
      return NextResponse.json(
        { error: 'Not authenticated' }, 
        { status: 401 }
      )
    }

    return NextResponse.json({ userId: userId.value, storeId: storeId.value })
  } catch (error) {
    console.error('Session error:', error)
    // エラー時もCookieを削除
    const cookieStore = await cookies()
    cookieStore.delete('userId')
    cookieStore.delete('storeId')
    cookieStore.delete('loginTime')
    
    return NextResponse.json(
      { error: 'Internal Server Error' }, 
      { status: 500 }
    )
  }
} 