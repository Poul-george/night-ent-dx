'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'ログインに失敗しました');
      }

      // ログイン成功時、ダッシュボードへリダイレクト
      router.push('/dashboard/home');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-full max-w-md p-8">
        <h1 className="text-2xl font-bold mb-8 text-center text-[#454545]">ログイン</h1>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}
        
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label 
              htmlFor="email" 
              className="block text-sm font-medium text-[#454545] mb-2"
            >
              メールアドレス
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-[#454545] focus:outline-none focus:ring-2 focus:ring-[#454545]"
              required
            />
          </div>

          <div>
            <label 
              htmlFor="password" 
              className="block text-sm font-medium text-[#454545] mb-2"
            >
              パスワード
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-[#454545] focus:outline-none focus:ring-2 focus:ring-[#454545]"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 px-4 bg-[#454545] text-[#FFFFFF] rounded-md hover:bg-[#353535] transition-colors"
          >
            ログイン
          </button>
        </form>
      </div>
    </div>
  );
}
