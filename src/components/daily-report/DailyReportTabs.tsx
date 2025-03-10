'use client';

import { useEffect, useState } from 'react';
import { useMenuState } from '@/hooks/useMenuState';
import DailyReportTableForCast from './DailyReportTableForCast';
import DailyReportTableForStore from './DailyReportTableForStore';
import { CastDailyPerformance } from '@/types/type';

type DailyReportTabsProps = {
  date: { year: number; month: number; day: number };
  storeId: number;
};

type TabType = 'cast' | 'store';

export default function DailyReportTabs({ date, storeId }: DailyReportTabsProps) {
  const [activeTab, setActiveTab] = useState<TabType>('cast');
  const { isSidebarCollapsed } = useMenuState();
  const [castDailyPerformances, setCastDailyPerformances] = useState<CastDailyPerformance[]>([]);

  useEffect(() => {
    const formattedDate = `${date.year}-${String(date.month).padStart(2, '0')}-${String(
      date.day
    ).padStart(2, '0')}`;
    async function fetchReportData() {
      try {
        const response = await fetch(`/api/daily-report/${formattedDate}?storeId=${storeId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch daily report data');
        }
        const data = await response.json();
        setCastDailyPerformances(data);
      } catch (error) {
        console.error('Error fetching daily report data:', error);
      }
    }
    fetchReportData();
  }, [date, storeId]);

  return (
    <div className={`${isSidebarCollapsed ? 'w-[calc(100vw-98px)]' : 'w-[calc(100vw-248px)]'}`}>
      {/* タブナビゲーション */}
      <div className="flex border-b border-gray-300 mb-4">
        <button
          className={`py-2 px-4 font-medium text-sl font-bold ${
            activeTab === 'cast'
              ? 'text-[#454545] border-b-2 border-[#454545]'
              : 'text-gray-500 hover:text-[#454545]'
          }`}
          onClick={() => setActiveTab('cast')}
        >
          キャスト日報
        </button>
        <button
          className={`py-2 px-4 font-medium text-sl font-bold ${
            activeTab === 'store'
              ? 'text-[#454545] border-b-2 border-[#454545]'
              : 'text-gray-500 hover:text-[#454545]'
          }`}
          onClick={() => setActiveTab('store')}
        >
          店舗日報
        </button>
      </div>

      {/* タブコンテンツ */}
      <div>
        {activeTab === 'cast' ? (
          <DailyReportTableForCast 
            date={date} 
            storeId={storeId} 
            castDailyPerformances={castDailyPerformances}
            setCastDailyPerformances={setCastDailyPerformances}
          />
        ) : (
          <DailyReportTableForStore date={date} storeId={storeId} castDailyPerformances={castDailyPerformances} />
        )}
      </div>
    </div>
  );
} 