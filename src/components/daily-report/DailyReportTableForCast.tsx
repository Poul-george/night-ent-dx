'use client';

import { useState, useRef, useEffect } from 'react';
import { FaTrash } from 'react-icons/fa';
import React from 'react';
import { useMenuState } from '@/hooks/useMenuState';
import { CastDailyPerformance } from '@/types/type';
import CastSelectModal from './CastSelectModal';
import DeletePerformanceDialog from './DeletePerformanceDialog';

type DailyReportTableProps = {
  date: { year: number; month: number; day: number };
  storeId: number;
};

export default function DailyReportTable({ date, storeId }: DailyReportTableProps) {
  const { isSidebarCollapsed } = useMenuState(); // サイドバーの状態を取得
  const [castDailyPerformances, setCastDailyPerformances] = useState<CastDailyPerformance[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // 削除ダイアログ用のステートを追加
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [performanceToDelete, setPerformanceToDelete] = useState<CastDailyPerformance | null>(null);
  
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
  
  // メインテーブルのヘッダー参照
  const mainHeaderRef = useRef<HTMLTableRowElement>(null);
  const subHeaderRef = useRef<HTMLTableRowElement>(null);
  
  // 時間と分を分割する関数
  const splitTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':').map(part => parseInt(part, 10));
    return { hours: hours || 0, minutes: minutes || 0 };
  };

  // 時間と分を結合する関数
  const combineTime = (hours: number, minutes: number) => {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  // 時間を分に変換する関数
  const timeToMinutes = (timeString: string) => {
    const { hours, minutes } = splitTime(timeString);
    return hours * 60 + minutes;
  };

  // 分を時間形式に変換する関数
  const minutesToTime = (totalMinutes: number) => {
    const hours = Math.floor(Math.abs(totalMinutes) / 60);
    const minutes = Math.abs(totalMinutes) % 60;
    const sign = totalMinutes < 0 ? '-' : '';
    return `${sign}${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  // 勤務時間を計算する関数
  const calculateWorkHours = (startTime: string, endTime: string, overtime: number) => {
    const startMinutes = timeToMinutes(startTime);
    let endMinutes = timeToMinutes(endTime);
    
    // 終了時間が開始時間より前の場合、翌日とみなす
    if (endMinutes < startMinutes) {
      endMinutes += 24 * 60; // 24時間分を加算
    }
    
    // 基本勤務時間（分）
    const baseWorkMinutes = endMinutes - startMinutes;
    // 時間外を加算
    const totalWorkMinutes = baseWorkMinutes + overtime;
    
    return minutesToTime(totalWorkMinutes);
  };

  // 時間給与を計算する関数
  const calculateTimeReward = (workHours: string, hourlyRate: number) => {
    const workMinutes = timeToMinutes(workHours);
    return Math.round((workMinutes / 60) * hourlyRate);
  };

  // 時間変更ハンドラー
  const handleHourChange = (castDailyPerformanceId: number, field: 'startTime' | 'endTime', hours: number) => {
    let newTimeValue = '';
    castDailyPerformances.map(castDailyPerformance => {
      if (castDailyPerformance.id === castDailyPerformanceId) {
        const { minutes } = splitTime(castDailyPerformance[field]);
        newTimeValue = combineTime(hours, minutes);
      }
    });

    handleInputChange(castDailyPerformanceId, field, newTimeValue);
  };

  // 分変更ハンドラー
  const handleMinuteChange = (castDailyPerformanceId: number, field: 'startTime' | 'endTime', minutes: number) => {
    let newTimeValue = '';
    castDailyPerformances.map(castDailyPerformance => {
      if (castDailyPerformance.id === castDailyPerformanceId) {
        const { hours } = splitTime(castDailyPerformance[field]);
        newTimeValue = combineTime(hours, minutes);
      }
    });

    handleInputChange(castDailyPerformanceId, field, newTimeValue);
  };

  // 時間外入力のハンドラー
  const handleOvertimeInput = (castId: number, value: string) => {
    // 数値のみ許可（マイナス記号も許可）
    const numericValue = value.replace(/[^\d-]/g, '');
    const overtime = numericValue ? parseInt(numericValue, 10) : 0;

    handleInputChange(castId, 'overtime', overtime);
  };

  // 時間オプション生成（0-23時）
  const hourOptions = React.useMemo(() => {
    return Array.from({ length: 24 }, (_, i) => (
      <option key={`hour-${i}`} value={i}>
        {i.toString().padStart(2, '0')}
      </option>
    ));
  }, []);

  // 分オプション生成（0-59分、1分単位）
  const minuteOptions = React.useMemo(() => {
    return Array.from({ length: 60 }, (_, i) => (
      <option key={`minute-${i}`} value={i}>
        {i.toString().padStart(2, '0')}
      </option>
    ));
  }, []);

  // 入力可能フィールドの更新ハンドラー
  const handleInputChange = (
    castDailyPerformanceId: number,
    field: keyof CastDailyPerformance,
    value: string | number
  ) => {
    setCastDailyPerformances(prevCastDailyPerformances =>
      prevCastDailyPerformances.map(castDailyPerformance => {
        if (castDailyPerformance.id === castDailyPerformanceId) {
          const updatedCastDailyPerformance = { ...castDailyPerformance, [field]: value };
          
          // 自動計算フィールドの更新
          // 勤務時間を再計算
          updatedCastDailyPerformance.workHours = calculateWorkHours(
            updatedCastDailyPerformance.startTime, 
            updatedCastDailyPerformance.endTime, 
            updatedCastDailyPerformance.overtime
          );
          
          // 時間給与を再計算
          updatedCastDailyPerformance.timeReward = calculateTimeReward(updatedCastDailyPerformance.workHours, updatedCastDailyPerformance.hourlyRate);

          // マイナス合計の計算
          updatedCastDailyPerformance.totalDeduction = 
            Number(updatedCastDailyPerformance.absenceDeduction) + 
            Number(updatedCastDailyPerformance.soriDeduction) + 
            Number(updatedCastDailyPerformance.tardinessDeduction) + 
            Number(updatedCastDailyPerformance.otherDeductions);
          
          // 総支給額の計算（簡易版 - 実際にはより複雑な計算が必要かもしれません）
          updatedCastDailyPerformance.totalPayment = 
            Number(updatedCastDailyPerformance.timeReward) + 
            Number(updatedCastDailyPerformance.drinkSubtotalBack) + 
            Number(updatedCastDailyPerformance.bottleSubtotalBack) + 
            Number(updatedCastDailyPerformance.foodSubtotalBack) + 
            Number(updatedCastDailyPerformance.bonus);
          
          // 残り支給額の計算
          updatedCastDailyPerformance.remainingPayment = updatedCastDailyPerformance.totalPayment - updatedCastDailyPerformance.dailyPayment;
          
          return updatedCastDailyPerformance;
        }
        return castDailyPerformance;
      })
    );
  };

  // 数値入力のハンドラー（カンマ区切りの処理）
  const handleNumberInput = (castId: number, field: keyof CastDailyPerformance, value: string) => {
    // カンマを削除して数値に変換
    const numericValue = value.replace(/[^\d-]/g, '');
    const numberValue = numericValue ? parseInt(numericValue, 10) : 0;
    handleInputChange(castId, field, numberValue);
  };

  // 削除ボタンのハンドラー
  const handleDeleteClick = (performance: CastDailyPerformance) => {
    setPerformanceToDelete(performance);
    setIsDeleteDialogOpen(true);
  };

  // 削除成功時のハンドラー
  const handleDeleteSuccess = () => {
    // 削除されたパフォーマンスを状態から除外
    if (performanceToDelete) {
      setCastDailyPerformances(prevPerformances => 
        prevPerformances.filter(p => p.id !== performanceToDelete.id)
      );
    }
  };

  // 保存処理
  const handleSave = async () => {
    try {
      const formattedDate = `${date.year}-${String(date.month).padStart(2, '0')}-${String(
        date.day
      ).padStart(2, '0')}`;
      
      const response = await fetch(`/api/daily-report/${formattedDate}?storeId=${storeId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          performances: castDailyPerformances
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save daily report');
      }
      alert('保存しました');
      
      // 保存後に最新データを再取得
      const refreshResponse = await fetch(`/api/daily-report/${formattedDate}?storeId=${storeId}`);
      if (refreshResponse.ok) {
        const refreshedData = await refreshResponse.json();
        setCastDailyPerformances(refreshedData);
      }
    } catch (error) {
      console.error('Error saving daily report:', error);
      alert('保存に失敗しました');
    }
  };

  // 数値のフォーマット（カンマ区切り）
  const formatNumber = (num: number) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  return (
    <>
      <div className={`overflow-x-auto`}>
        <div className="flex">
          {/* 固定列（キャスト名） */}
          <div className="w-[150px] flex-shrink-0">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th 
                    className="border border-gray-300 bg-gray-100 sticky top-0 z-10 text-[15px] py-1 px-2 h-[92px] text-[#454545]"
                  >
                    キャスト名
                  </th>
                </tr>
              </thead>
              <tbody>
                {castDailyPerformances.map(castDailyPerformance => (
                  <tr key={castDailyPerformance.id} style={{ height: '50px' }}>
                    <td className="border border-gray-300 relative py-0 px-2">
                      <div className="flex items-center h-full">
                        <span className="w-full text-[14px] text-[#454545]">{castDailyPerformance.castName}</span>
                        <button
                          onClick={() => handleDeleteClick(castDailyPerformance)}
                          className="ml-2 text-[#454545] hover:text-[#353535]"
                        >
                          <FaTrash size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* スクロール可能な列 */}
          <div className="overflow-x-auto">
            <table className="border-collapse whitespace-nowrap">
              <thead>
                <tr ref={mainHeaderRef} className="h-[32px]">
                  <th colSpan={5} className="border border-gray-300 bg-gray-100 text-center sticky top-0 z-10 text-[15px] py-0 px-2 text-[#454545]">勤怠</th>
                  <th colSpan={4} className="border border-gray-300 bg-gray-100 text-center sticky top-0 z-10 text-[15px] py-0 px-2 text-[#454545]">日払い支給額</th>
                  <th colSpan={5} className="border border-gray-300 bg-gray-100 text-center sticky top-0 z-10 text-[15px] py-0 px-2 text-[#454545]">マイナス</th>
                  <th colSpan={7} className="border border-gray-300 bg-gray-100 text-center sticky top-0 z-10 text-[15px] py-0 px-2 text-[#454545]">各種バック・ボーナス</th>
                </tr>
                <tr ref={subHeaderRef} className="sticky z-10 h-[60px]">
                  {/* 勤怠 */}
                  <th className="border border-gray-300 bg-gray-100 text-[15px] h-[60px] py-1 px-2 text-[#454545]">開始</th>
                  <th className="border border-gray-300 bg-gray-100 text-[15px] h-[60px] py-1 px-2 text-[#454545]">終了</th>
                  <th className="border border-gray-300 bg-gray-100 text-[15px] h-[60px] py-1 px-2 text-[#454545]">時間外</th>
                  <th className="border border-gray-300 bg-gray-100 text-[15px] h-[60px] py-1 px-2 text-[#454545]">勤務時間</th>
                  <th className="border border-gray-300 bg-gray-100 text-[15px] h-[60px] py-1 px-2 text-[#454545]">時間給与<br/>時給</th>
                  
                  {/* 日払い支給額 */}
                  <th className="border border-gray-300 bg-gray-100 text-[15px] h-[60px] py-1 px-2 text-[#454545]">厚生費</th>
                  <th className="border border-gray-300 bg-gray-100 text-[15px] h-[60px] py-1 px-2 text-[#454545]">日払い額</th>
                  <th className="border border-gray-300 bg-gray-100 text-[15px] h-[60px] py-1 px-2 text-[#454545]">総支給額</th>
                  <th className="border border-gray-300 bg-gray-100 text-[15px] h-[60px] py-1 px-2 text-[#454545]">残支給額</th>
                  
                  {/* マイナス */}
                  <th className="border border-gray-300 bg-gray-100 text-[15px] h-[60px] py-1 px-2 text-[#454545]">欠勤</th>
                  <th className="border border-gray-300 bg-gray-100 text-[15px] h-[60px] py-1 px-2 text-[#454545]">送り</th>
                  <th className="border border-gray-300 bg-gray-100 text-[15px] h-[60px] py-1 px-2 text-[#454545]">遅刻</th>
                  <th className="border border-gray-300 bg-gray-100 text-[15px] h-[60px] py-1 px-2 text-[#454545]">その他</th>
                  <th className="border border-gray-300 bg-gray-100 text-[15px] h-[60px] py-1 px-2 text-[#454545]">合計</th>
                  
                  {/* 各種バック・ボーナス */}
                  <th className="border border-gray-300 bg-gray-100 text-[15px] h-[60px] py-1 px-2 text-[#454545]">ドリンク<br/>小計</th>
                  <th className="border border-gray-300 bg-gray-100 text-[15px] h-[60px] py-1 px-2 text-[#454545]">ドリンク<br/>バック</th>
                  <th className="border border-gray-300 bg-gray-100 text-[15px] h-[60px] py-1 px-2 text-[#454545]">ボトル<br/>小計</th>
                  <th className="border border-gray-300 bg-gray-100 text-[15px] h-[60px] py-1 px-2 text-[#454545]">ボトル<br/>バック</th>
                  <th className="border border-gray-300 bg-gray-100 text-[15px] h-[60px] py-1 px-2 text-[#454545]">フード<br/>小計</th>
                  <th className="border border-gray-300 bg-gray-100 text-[15px] h-[60px] py-1 px-2 text-[#454545]">フード<br/>バック</th>
                  <th className="border border-gray-300 bg-gray-100 text-[15px] h-[60px] py-1 px-2 text-[#454545]">ボーナス</th>
                </tr>
              </thead>
              <tbody>
                {castDailyPerformances.map(castDailyPerformance => (
                  <tr key={castDailyPerformance.id} style={{ height: '50px' }}>
                    {/* 勤怠 */}
                    <td className="border border-gray-300 py-0 px-1">
                      <div className="flex items-center space-x-1">
                        <select
                          value={splitTime(castDailyPerformance.startTime).hours}
                          onChange={(e) => handleHourChange(castDailyPerformance.id, 'startTime', parseInt(e.target.value, 10))}
                          className="w-[25px] border border-[#454545] rounded text-center text-[14px] h-[30px] appearance-none cursor-pointer bg-white text-[#454545]"
                        >
                          {hourOptions}
                        </select>
                        <span className="text-[14px] text-[#454545]">:</span>
                        <select
                          value={splitTime(castDailyPerformance.startTime).minutes}
                          onChange={(e) => handleMinuteChange(castDailyPerformance.id, 'startTime', parseInt(e.target.value, 10))}
                          className="w-[25px] border border-[#454545] rounded text-center text-[14px] h-[30px] appearance-none cursor-pointer bg-white text-[#454545]"
                        >
                          {minuteOptions}
                        </select>
                      </div>
                    </td>
                    <td className="border border-gray-300 py-0 px-1">
                      <div className="flex items-center space-x-1">
                        <select
                          value={splitTime(castDailyPerformance.endTime).hours}
                          onChange={(e) => handleHourChange(castDailyPerformance.id, 'endTime', parseInt(e.target.value, 10))}
                          className="w-[25px] border border-[#454545] rounded text-center text-[14px] h-[30px] appearance-none cursor-pointer bg-white text-[#454545]"
                        >
                          {hourOptions}
                        </select>
                        <span className="text-[14px] text-[#454545]">:</span>
                        <select
                          value={splitTime(castDailyPerformance.endTime).minutes}
                          onChange={(e) => handleMinuteChange(castDailyPerformance.id, 'endTime', parseInt(e.target.value, 10))}
                          className="w-[25px] border border-[#454545] rounded text-center text-[14px] h-[30px] appearance-none cursor-pointer bg-white text-[#454545]"
                        >
                          {minuteOptions}
                        </select>
                      </div>
                    </td>
                    <td className="border border-gray-300 py-0 px-1">
                      <input
                        type="text"
                        value={castDailyPerformance.overtime}
                        onChange={(e) => handleOvertimeInput(castDailyPerformance.id, e.target.value)}
                        className="w-full border border-[#454545] rounded text-center text-[14px] h-[30px] text-[#454545]"
                      />
                    </td>
                    <td className="border border-gray-300 py-0 px-1 text-center text-[14px] text-[#454545]">{castDailyPerformance.workHours}</td>
                    <td className="border border-gray-300 py-0 px-1">
                      <div className="flex flex-col leading-tight">
                        <span className="text-[14px] text-[#454545] text-right">¥{formatNumber(castDailyPerformance.timeReward)}</span>
                        <span className="text-[12px] text-[#454545] text-right">¥{formatNumber(castDailyPerformance.hourlyRate)}</span>
                      </div>
                    </td>
                    
                    {/* 日払い支給額 */}
                    <td className="border border-gray-300 py-0 px-1">
                      <input
                        type="text"
                        value={formatNumber(castDailyPerformance.welfareCost)}
                        onChange={(e) => handleNumberInput(castDailyPerformance.id, 'welfareCost', e.target.value)}
                        className="w-full border border-[#454545] rounded text-right text-[14px] h-[30px] text-[#454545]"
                      />
                    </td>
                    <td className="border border-gray-300 py-0 px-1">
                      <input
                        type="text"
                        value={formatNumber(castDailyPerformance.dailyPayment)}
                        onChange={(e) => handleNumberInput(castDailyPerformance.id, 'dailyPayment', e.target.value)}
                        className="w-full border border-[#454545] rounded text-right text-[14px] h-[30px] text-[#454545]"
                      />
                    </td>
                    <td className="border border-gray-300 py-0 px-1 text-right text-[14px] text-[#454545]">¥{formatNumber(castDailyPerformance.totalPayment)}</td>
                    <td className="border border-gray-300 py-0 px-1 text-right text-[14px] text-[#454545]">¥{formatNumber(castDailyPerformance.remainingPayment)}</td>
                    
                    {/* マイナス */}
                    <td className="border border-gray-300 py-0 px-1">
                      <input
                        type="text"
                        value={formatNumber(castDailyPerformance.absenceDeduction)}
                        onChange={(e) => handleNumberInput(castDailyPerformance.id, 'absenceDeduction', e.target.value)}
                        className="w-[55px] border border-[#454545] rounded text-right text-[14px] h-[30px] text-[#454545]"
                      />
                    </td>
                    <td className="border border-gray-300 py-0 px-1">
                      <input
                        type="text"
                        value={formatNumber(castDailyPerformance.soriDeduction)}
                        onChange={(e) => handleNumberInput(castDailyPerformance.id, 'soriDeduction', e.target.value)}
                        className="w-[55px] border border-[#454545] rounded text-right text-[14px] h-[30px] text-[#454545]"
                      />
                    </td>
                    <td className="border border-gray-300 py-0 px-1">
                      <input
                        type="text"
                        value={formatNumber(castDailyPerformance.tardinessDeduction)}
                        onChange={(e) => handleNumberInput(castDailyPerformance.id, 'tardinessDeduction', e.target.value)}
                        className="w-[55px] border border-[#454545] rounded text-right text-[14px] h-[30px] text-[#454545]"
                      />
                    </td>
                    <td className="border border-gray-300 py-0 px-1">
                      <input
                        type="text"
                        value={formatNumber(castDailyPerformance.otherDeductions)}
                        onChange={(e) => handleNumberInput(castDailyPerformance.id, 'otherDeductions', e.target.value)}
                        className="w-[55px] border border-[#454545] rounded text-right text-[14px] h-[30px] text-[#454545]"
                      />
                    </td>
                    <td className="border border-gray-300 py-0 px-1 text-right text-[14px] text-[#454545]">¥{formatNumber(castDailyPerformance.totalDeduction)}</td>
                    
                    {/* 各種バック・ボーナス */}
                    <td className="border border-gray-300 py-0 px-1">
                      <input
                        type="text"
                        value={formatNumber(castDailyPerformance.drinkSubtotal)}
                        onChange={(e) => handleNumberInput(castDailyPerformance.id, 'drinkSubtotal', e.target.value)}
                        className="w-[68px] border border-[#454545] rounded text-right text-[14px] h-[30px] text-[#454545]"
                      />
                    </td>
                    <td className="border border-gray-300 py-0 px-1">
                      <input
                        type="text"
                        value={formatNumber(castDailyPerformance.drinkSubtotalBack)}
                        onChange={(e) => handleNumberInput(castDailyPerformance.id, 'drinkSubtotalBack', e.target.value)}
                        className="w-[68px] border border-[#454545] rounded text-right text-[14px] h-[30px] text-[#454545]"
                      />
                    </td>
                    <td className="border border-gray-300 py-0 px-1">
                      <input
                        type="text"
                        value={formatNumber(castDailyPerformance.bottleSubtotal)}
                        onChange={(e) => handleNumberInput(castDailyPerformance.id, 'bottleSubtotal', e.target.value)}
                        className="w-[68px] border border-[#454545] rounded text-right text-[14px] h-[30px] text-[#454545]"
                      />
                    </td>
                    <td className="border border-gray-300 py-0 px-1">
                      <input
                        type="text"
                        value={formatNumber(castDailyPerformance.bottleSubtotalBack)}
                        onChange={(e) => handleNumberInput(castDailyPerformance.id, 'bottleSubtotalBack', e.target.value)}
                        className="w-[68px] border border-[#454545] rounded text-right text-[14px] h-[30px] text-[#454545]"
                      />
                    </td>
                    <td className="border border-gray-300 py-0 px-1">
                      <input
                        type="text"
                        value={formatNumber(castDailyPerformance.foodSubtotal)}
                        onChange={(e) => handleNumberInput(castDailyPerformance.id, 'foodSubtotal', e.target.value)}
                        className="w-[68px] border border-[#454545] rounded text-right text-[14px] h-[30px] text-[#454545]"
                      />
                    </td>
                    <td className="border border-gray-300 py-0 px-1">
                      <input
                        type="text"
                        value={formatNumber(castDailyPerformance.foodSubtotalBack)}
                        onChange={(e) => handleNumberInput(castDailyPerformance.id, 'foodSubtotalBack', e.target.value)}
                        className="w-[68px] border border-[#454545] rounded text-right text-[14px] h-[30px] text-[#454545]"
                      />
                    </td>
                    <td className="border border-gray-300 py-0 px-1">
                      <input
                        type="text"
                        value={formatNumber(castDailyPerformance.bonus)}
                        onChange={(e) => handleNumberInput(castDailyPerformance.id, 'bonus', e.target.value)}
                        className="w-[68px] border border-[#454545] rounded text-right text-[14px] h-[30px] text-[#454545]"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      <div className={`mt-4 flex justify-end space-x-4 ${isSidebarCollapsed ? 'max-w-[calc(100vw-90px)]' : 'max-w-[calc(100vw-240px)]'}`}>
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-[#454545] text-white rounded-md font-medium hover:bg-[#353535] text-[14px]"
        >
          保存する
        </button>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-white text-[#454545] border border-[#454545] rounded-md font-medium hover:bg-gray-50 text-[14px]"
        >
          キャスト項目を追加
        </button>
      </div>
      
      {/* キャスト選択モーダル */}
      <CastSelectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        setCastDailyPerformances={setCastDailyPerformances}
        storeId={storeId}
        castDailyPerformances={castDailyPerformances}
      />
      
      {/* 削除確認ダイアログ */}
      <DeletePerformanceDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        performance={performanceToDelete}
        onDeleteSuccess={handleDeleteSuccess}
        date={date}
      />
    </>
  );
}
