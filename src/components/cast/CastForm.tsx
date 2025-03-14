'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Cast } from '@/types/type';

type CastFormProps = {
  initialData?: Partial<Cast>;
  mode: 'create' | 'edit';
  onSubmit: (data: Partial<Cast>) => Promise<void>;
};

export default function CastForm({ initialData, mode, onSubmit }: CastFormProps) {
  const router = useRouter();
  const [name, setName] = useState(initialData?.name || '');
  const [salarySystem, setSalarySystem] = useState(initialData?.salarySystem ?? 0); // 0: 月給, 1: 時給
  const [monthlySalary, setMonthlySalary] = useState(initialData?.monthlySalary?.toString() || '');
  const [hourlyWage, setHourlyWage] = useState(initialData?.hourlyWage?.toString() || '');
  const [backSetting, setBackSetting] = useState(initialData?.backSetting ?? 1); // 0: 無し, 1: 有り
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 金額のフォーマット関数
  const formatCurrency = (value: string): string => {
    // 数値以外の文字を削除
    const numericValue = value.replace(/[^\d]/g, '');
    
    if (!numericValue) return '';
    
    // 数値をフォーマット (3桁ごとにカンマを挿入)
    const formatted = Number(numericValue).toLocaleString();
    return `¥${formatted}`;
  };

  // 表示用フォーマット値
  const formattedMonthlySalary = monthlySalary ? formatCurrency(monthlySalary) : '';
  const formattedHourlyWage = hourlyWage ? formatCurrency(hourlyWage) : '';

  // 入力ハンドラー (数値のみを保持)
  const handleMonthlySalaryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^\d]/g, '');
    setMonthlySalary(value);
  };

  const handleHourlyWageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^\d]/g, '');
    setHourlyWage(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // リクエストデータを構築
      const requestData: Partial<Cast> = {
        name,
        salarySystem,
        backSetting,
        ...(initialData?.id && { id: initialData.id }),
        ...(initialData?.storeId && { storeId: initialData.storeId })
      };

      // 給与体系に応じて適切なフィールドのみを追加
      if (salarySystem === 0 && monthlySalary) {
        requestData.monthlySalary = Number(monthlySalary);
      } else if (salarySystem === 1 && hourlyWage) {
        requestData.hourlyWage = Number(hourlyWage);
      }

      // 親コンポーネントの送信処理を呼び出す
      await onSubmit(requestData);
      
      // 成功したら一覧ページに遷移
      router.push('/dashboard/cast/list');
    } catch (error) {
      console.error(`Error ${mode === 'create' ? 'creating' : 'updating'} cast:`, error);
      setError(error instanceof Error ? error.message : '予期せぬエラーが発生しました');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-[#454545] mb-6">
        {mode === 'create' ? 'キャスト作成' : 'キャスト編集'}
      </h1>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 max-w-2xl">
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label htmlFor="name" className="block text-[#454545] font-bold mb-2">
              名前
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-200"
              required
            />
          </div>

          <div className="mb-6">
            <label htmlFor="salarySystem" className="block text-[#454545] font-bold mb-2">
              給与体系
            </label>
            <div className="relative">
              <select
                id="salarySystem"
                value={salarySystem}
                onChange={(e) => setSalarySystem(Number(e.target.value))}
                className="w-full p-3 border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-gray-200"
              >
                <option value={0}>月給</option>
                <option value={1}>時給</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </div>
            </div>
          </div>

          {salarySystem === 0 ? (
            <div className="mb-6">
              <label htmlFor="monthlySalary" className="block text-[#454545] font-bold mb-2">
                月給
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="monthlySalary"
                  value={formattedMonthlySalary}
                  onChange={handleMonthlySalaryChange}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-200"
                  placeholder="¥300,000"
                />
              </div>
            </div>
          ) : (
            <div className="mb-6">
              <label htmlFor="hourlyWage" className="block text-[#454545] font-bold mb-2">
                時給
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="hourlyWage"
                  value={formattedHourlyWage}
                  onChange={handleHourlyWageChange}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-200"
                  placeholder="¥1,500"
                />
              </div>
            </div>
          )}

          <div className="mb-8">
            <label htmlFor="backSetting" className="block text-[#454545] font-bold mb-2">
              バック設定
            </label>
            <div className="relative">
              <select
                id="backSetting"
                value={backSetting}
                onChange={(e) => setBackSetting(Number(e.target.value))}
                className="w-full p-3 border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-gray-200"
              >
                <option value={1}>有り</option>
                <option value={0}>無し</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </div>
            </div>
          </div>

          <div className="flex justify-center space-x-4">
            <Link
              href="/dashboard/cast/list"
              className="px-6 py-2 border border-gray-300 rounded-md text-[#454545] font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200"
            >
              キャンセル
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-[#454545] text-white rounded-md font-medium hover:bg-[#353535] focus:outline-none focus:ring-2 focus:ring-gray-400 disabled:opacity-50"
            >
              {mode === 'create' ? '作成する' : '変更する'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 