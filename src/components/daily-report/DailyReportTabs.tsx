'use client';

import { useState } from 'react';
import { useMenuState } from '@/hooks/useMenuState';
import DailyReportTableForCast from './DailyReportTableForCast';
import DailyReportTableForStore from './DailyReportTableForStore';

type DailyReportTabsProps = {
  date: { year: number; month: number; day: number };
  storeId: number;
};

type TabType = 'cast' | 'store';

export default function DailyReportTabs({ date, storeId }: DailyReportTabsProps) {
  const [activeTab, setActiveTab] = useState<TabType>('cast');
  const { isSidebarCollapsed } = useMenuState();

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
          <DailyReportTableForCast date={date} storeId={storeId} />
        ) : (
          <DailyReportTableForStore date={date} storeId={storeId} />
        )}
      </div>
    </div>
  );
} 