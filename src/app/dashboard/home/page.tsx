'use client'
import { useEffect, useState } from 'react'

type User = {
  id: number
  name: string
  email: string
  storeId: number | null
  createdAt: string
}

export default function DashboardHome() {
  const [user, setUser] = useState<User | null>(null)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    const fetchUser = async () => {
      try {
        // まずセッションからuserIdを取得
        const sessionResponse = await fetch('/api/auth/session')
        if (!sessionResponse.ok) throw new Error('Session not found')
        const sessionData = await sessionResponse.json()

        // 取得したuserIdを使ってユーザー情報を取得
        const userResponse = await fetch(`/api/users/${sessionData.userId}`)
        if (!userResponse.ok) throw new Error('User not found')
        const userData = await userResponse.json()
        setUser(userData)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error fetching user')
      }
    }

    fetchUser()
  }, [])

  if (error) return <div>Error: {error}</div>
  if (!user) return <div>Loading...</div>

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-2xl font-bold text-[#454545] mb-4">ユーザー情報</h1>
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <p className="mb-2">名前: {user.name}</p>
        <p className="mb-2">メール: {user.email}</p>
        <p className="mb-2">店舗ID: {user.storeId || 'なし'}</p>
        <p>作成日: {new Date(user.createdAt).toLocaleDateString('ja-JP')}</p>
      </div>
    </div>
  )
} 