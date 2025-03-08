'use client';

import { useState } from 'react';
import { useMenuState } from '@/hooks/useMenuState';

type DailyReportTableForStoreProps = {
  date: { year: number; month: number; day: number };
  storeId: number;
};

export default function DailyReportTableForStore({ date, storeId }: DailyReportTableForStoreProps) {
  const { isSidebarCollapsed } = useMenuState();
  
  // 保存処理
  const handleSave = async () => {
    try {
      // 店舗日報の保存処理（実装予定）
      alert('店舗日報を保存しました');
    } catch (error) {
      console.error('Error saving store daily report:', error);
      alert('保存に失敗しました');
    }
  };

  return (
    <>
      <div className={`mt-4 flex justify-end space-x-4 ${isSidebarCollapsed ? 'max-w-[calc(100vw-90px)]' : 'max-w-[calc(100vw-240px)]'}`}>
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-[#454545] text-white rounded-md font-medium hover:bg-[#353535] text-[14px]"
        >
          保存する
        </button>
      </div>
    </>
  );
} 