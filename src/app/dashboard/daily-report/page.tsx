'use client';

import { useState, useCallback, useEffect } from 'react';
import DateSelector from '@/components/common/DateSelector';
import DailyReportTable from '@/components/daily-report/DailyReportTable';

export default function DailyReport() {
  // 現在の日付を初期値として設定
  const today = new Date();
  const initialDate = {
    year: today.getFullYear(),
    month: today.getMonth() + 1,
    day: today.getDate()
  };
  
  const [selectedDate, setSelectedDate] = useState<{ year: number; month: number; day: number }>(initialDate);
  const [storeId, setStoreId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // セッションからstoreIdを取得
  useEffect(() => {
    const fetchSession = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/auth/session');
        
        if (!response.ok) {
          throw new Error('Failed to fetch session');
        }
        
        const data = await response.json();
        if (data.storeId) {
          setStoreId(data.storeId);
        } else {
          console.error('Store ID not found in session');
        }
      } catch (error) {
        console.error('Error fetching session:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSession();
  }, []);
  
  const handleDateChange = useCallback((date: { year: number; month: number; day: number }) => {
    setSelectedDate(date);
  }, []);

  if (isLoading) {
    return <div className="p-4 md:p-6">Loading...</div>;
  }

  if (!storeId) {
    return <div className="p-4 md:p-6">店舗情報が見つかりません。</div>;
  }

  return (
    <div className="p-4 md:p-6 max-w-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[#454545]">日報登録</h1>
        <DateSelector 
          initialDate={initialDate} 
          onChange={handleDateChange} 
        />
      </div>
      <DailyReportTable date={selectedDate} storeId={storeId} />
    </div>
  );
} 
