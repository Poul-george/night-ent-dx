'use client';

import { useEffect, useState } from 'react';
import { Cast } from '@/types/type';
import Link from 'next/link';

export default function CastList() {
  const [casts, setCasts] = useState<Cast[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCasts = async () => {
      try {
        // セッションからstoreIdを取得
        const sessionResponse = await fetch('/api/auth/session');
        if (!sessionResponse.ok) throw new Error('Failed to fetch session');
        const sessionData = await sessionResponse.json();

        // storeIdを使ってキャスト一覧を取得
        const castsResponse = await fetch(`/api/stores/${sessionData.storeId}/casts`);
        if (!castsResponse.ok) throw new Error('Failed to fetch casts');
        const castsData = await castsResponse.json();
        
        setCasts(castsData);
      } catch (err) {
        console.error('Error fetching casts:', err);
        setError(err instanceof Error ? err.message : '予期せぬエラーが発生しました');
      } finally {
        setLoading(false);
      }
    };

    fetchCasts();
  }, []);

  // 給与体系の表示を変換する関数
  const formatSalarySystem = (system: number) => {
    return system === 0 ? '月給' : '時給';
  };

  // 金額のフォーマット
  const formatCurrency = (amount: number | null) => {
    if (amount === null) return '−';
    return `¥${amount.toLocaleString()}`;
  };

  // バック設定の表示
  const formatBackSetting = (setting: number) => {
    return setting === 0 ? '無し' : '有り';
  };

  if (loading) return <div className="p-8">読み込み中...</div>;
  if (error) return <div className="p-8 text-red-500">エラー: {error}</div>;

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[#454545]">キャスト一覧</h1>
        <Link 
          href="/dashboard/cast/new" 
          className="flex items-center px-4 py-2 bg-[#454545] text-white rounded-md hover:bg-[#353535]"
        >
          <span className="mr-1 text-xl font-bold">+</span>
          <span>新規キャスト登録</span>
        </Link>
      </div>

      <div className="overflow-x-auto border border-gray-300 rounded-md">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="bg-[#F9F9FC] p-3 text-center font-bold text-[#454545] border-b border-gray-300 w-[25%]">名前</th>
              <th className="bg-[#F9F9FC] p-3 text-center font-bold text-[#454545] border-b border-gray-300 w-[10%]">給与体系</th>
              <th className="bg-[#F9F9FC] p-3 text-center font-bold text-[#454545] border-b border-gray-300 w-[15%]">月給</th>
              <th className="bg-[#F9F9FC] p-3 text-center font-bold text-[#454545] border-b border-gray-300 w-[15%]">時給</th>
              <th className="bg-[#F9F9FC] p-3 text-center font-bold text-[#454545] border-b border-gray-300 w-[15%]">バック設定</th>
              <th className="bg-[#F9F9FC] p-3 text-center font-bold text-[#454545] border-b border-gray-300 w-[20%]">操作</th>
            </tr>
          </thead>
          <tbody>
            {casts.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-3 text-center border-b border-gray-300">
                  キャストが登録されていません
                </td>
              </tr>
            ) : (
              casts.map((cast) => (
                <tr key={cast.id} className="hover:bg-gray-50 border-b border-gray-300">
                  <td className="p-3 text-center font-bold">{cast.name}</td>
                  <td className="p-3 text-center font-bold">{formatSalarySystem(cast.salarySystem)}</td>
                  <td className="p-3 text-center font-bold">{formatCurrency(cast.monthlySalary)}</td>
                  <td className="p-3 text-center font-bold">{formatCurrency(cast.hourlyWage)}</td>
                  <td className="p-3 text-center font-bold">{formatBackSetting(cast.backSetting)}</td>
                  <td className="p-3 text-center">
                    <div className="flex justify-center space-x-3">
                      <Link 
                        href={`/dashboard/cast/edit/${cast.id}`}
                        className="px-3 py-1 bg-white text-[#454545] border border-[#757575] rounded font-semibold hover:bg-gray-100 shadow-md hover:shadow-lg transition-all"
                      >
                        編集
                      </Link>
                      <button 
                        className="px-3 py-1 bg-white text-[#454545] border border-[#757575] rounded font-semibold hover:bg-gray-100 shadow-md hover:shadow-lg transition-all"
                        onClick={() => {
                          // 削除確認処理を実装
                          if (window.confirm(`${cast.name}を削除しますか？`)) {
                            // 削除APIを呼び出す処理を実装
                            console.log('削除処理:', cast.id);
                          }
                        }}
                      >
                        削除
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
} 