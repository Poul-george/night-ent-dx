'use client';

import { useState, useEffect, useCallback } from 'react';

type DateSelectorProps = {
  onChange: (date: { year: number; month: number; day: number }) => void;
  initialDate?: { year: number; month: number; day: number };
};

export default function DateSelector({ onChange, initialDate }: DateSelectorProps) {
  // 現在の日付を取得
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1; // JavaScriptの月は0から始まるため+1
  const currentDay = today.getDate();

  // 初期値の設定（指定がなければ今日の日付）
  const [year, setYear] = useState(initialDate?.year || currentYear);
  const [month, setMonth] = useState(initialDate?.month || currentMonth);
  const [day, setDay] = useState(initialDate?.day || currentDay);

  // 年の選択肢（現在の年から前後5年）
  const yearOptions = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);
  
  // 月の選択肢
  const monthOptions = Array.from({ length: 12 }, (_, i) => i + 1);
  
  // 日の選択肢（選択された年月に基づいて計算）
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month, 0).getDate();
  };
  
  const dayOptions = Array.from(
    { length: getDaysInMonth(year, month) }, 
    (_, i) => i + 1
  );

  // 日付が変更されたときに親コンポーネントに通知（メモ化して無限ループを防止）
  const notifyDateChange = useCallback(() => {
    onChange({ year, month, day });
  }, [year, month, day, onChange]);

  // 初回レンダリング時と日付変更時に親コンポーネントに通知
  useEffect(() => {
    notifyDateChange();
  }, [notifyDateChange]);

  // 月が変わったときに、選択されている日が新しい月の最大日数を超えていたら調整
  useEffect(() => {
    const daysInMonth = getDaysInMonth(year, month);
    if (day > daysInMonth) {
      setDay(daysInMonth);
    }
  }, [year, month, day]);

  return (
    <div className="flex items-center bg-[#333] text-white rounded-md p-2 w-[340px]">
      <span className="mr-2 whitespace-nowrap">年月日を指定</span>
      
      <div className="flex items-center space-x-1">
        <div className="relative">
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="appearance-none bg-white text-black rounded-md py-1 pl-2 pr-6 text-sm focus:outline-none"
            style={{ width: '80px' }}
          >
            {yearOptions.map((y) => (
              <option key={y} value={y}>
                {y}年
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-1 pointer-events-none">
            <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"></path>
            </svg>
          </div>
        </div>

        <div className="relative">
          <select
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            className="appearance-none bg-white text-black rounded-md py-1 pl-2 pr-6 text-sm focus:outline-none"
            style={{ width: '65px' }}
          >
            {monthOptions.map((m) => (
              <option key={m} value={m}>
                {m.toString().padStart(2, '0')}月
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-1 pointer-events-none">
            <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"></path>
            </svg>
          </div>
        </div>

        <div className="relative">
          <select
            value={day}
            onChange={(e) => setDay(Number(e.target.value))}
            className="appearance-none bg-white text-black rounded-md py-1 pl-2 pr-6 text-sm focus:outline-none"
            style={{ width: '65px' }}
          >
            {dayOptions.map((d) => (
              <option key={d} value={d}>
                {d.toString().padStart(2, '0')}日
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-1 pointer-events-none">
            <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"></path>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
} 