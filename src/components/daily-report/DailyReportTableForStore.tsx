'use client';

import { useState, useEffect, useCallback } from 'react';
import { useMenuState } from '@/hooks/useMenuState';
import { CastDailyPerformance, StoreDailyPerformance } from '@/types/type';
import { formatNumber, formatPercent } from './utils/commonUtils';
import { calculateDailyReportValues, getInitializedData } from './utils/storeReportCalculations';

type DailyReportTableForStoreProps = {
  date: { year: number; month: number; day: number };
  storeId: number;
  castDailyPerformances: CastDailyPerformance[];
};

export default function DailyReportTableForStore({ date, storeId, castDailyPerformances }: DailyReportTableForStoreProps) {
  const { isSidebarCollapsed } = useMenuState();
  
  // 店舗日報データのステート
  const [dailyStoreReport, setDailyStoreReport] = useState<StoreDailyPerformance>(getInitializedData(storeId, date));
  const [monthlyStoreReport, setMonthlyStoreReport] = useState<StoreDailyPerformance>(getInitializedData(storeId, date));
  
  // 日報、月報データを取得する関数
  const fetchStoreReport = useCallback(async () => {
    try {
      const formattedDate = `${date.year}-${String(date.month).padStart(2, '0')}-${String(date.day).padStart(2, '0')}`;
      const response = await fetch(`/api/store-daily-report/${formattedDate}?storeId=${storeId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch store daily report');
      }
      
      const data = await response.json();
      
      // データが存在する場合はそれを使用し、存在しない場合は初期化されたデータを使用
      const reportData = data.storeReport || getInitializedData(storeId, date);
      const monthlyReportData = data.monthlyReport || getInitializedData(storeId, date);
      // データをステートに設定
      setDailyStoreReport(reportData);
      setMonthlyStoreReport(monthlyReportData);
      
      // 計算処理を実行
      const calculatedValues = calculateDailyReportValues(reportData, castDailyPerformances);
      setDailyStoreReport(prev => ({ ...prev, ...calculatedValues }));
      
    } catch (error) {
      console.error('Error fetching store daily report:', error);
    }
  }, [date, storeId, castDailyPerformances]);
  
  // コンポーネントマウント時に日報データを取得
  useEffect(() => {
    fetchStoreReport();
  }, [fetchStoreReport]);
  
  // 入力フィールドのスタイル
  const inputStyle = "w-full border border-[#454545] rounded text-right text-[14px] h-[30px] text-[#454545]";
  
  // 数値入力のハンドラー
  const handleInputChange = (field: keyof StoreDailyPerformance, value: string) => {
    // カンマを削除して数値に変換
    const numericValue = value.replace(/,/g, '');
    const parsedValue = numericValue === '' ? 0 : parseInt(numericValue, 10);
    
    setDailyStoreReport(prev => {
      const updatedReport = { ...prev, [field]: parsedValue };
      const calculatedValues = calculateDailyReportValues(updatedReport, castDailyPerformances);
      return { ...updatedReport, ...calculatedValues };
    });
  };
  
  // 保存処理
  const handleSave = async () => {
    try {
      const formattedDate = `${date.year}-${String(date.month).padStart(2, '0')}-${String(date.day).padStart(2, '0')}`;
      
      const response = await fetch(`/api/store-daily-report/${formattedDate}?storeId=${storeId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dailyStoreReport),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save store daily report');
      }
      
      alert('店舗日報を保存しました');
    } catch (error) {
      console.error('Error saving store daily report:', error);
      alert('保存に失敗しました');
    }
  };
  
  return (
    <>
      <div className="bg-white rounded-md shadow-sm p-4 mb-20 overflow-x-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            {/* 入金項目 */}
            <div>
              <h3 className="text-lg font-medium text-[#454545] mb-3">入金項目</h3>
              <table className="w-full border-collapse table-fixed">
                <thead>
                  <tr>
                    <th className="border border-gray-300 bg-gray-100 py-2 px-3 w-[110px]"></th>
                    <th className="border border-gray-300 bg-gray-100 py-2 px-3 text-center w-[150px]">本日合計</th>
                    <th className="border border-gray-300 bg-gray-100 py-2 px-3 w-[100px] text-center">当月累積</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-300 py-2 px-3">総売上</td>
                    <td className="border border-gray-300 py-2 px-3 text-right">¥{formatNumber(dailyStoreReport.totalSales)}</td>
                    <td className="border border-gray-300 py-2 px-3 text-right">¥{formatNumber(monthlyStoreReport.totalSales)}</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 py-2 px-3">現金売上</td>
                    <td className="border border-gray-300 py-2 px-3">
                      <div className="flex items-center">
                        <span className="text-[#454545] mr-1">¥</span>
                        <input
                          type="text"
                          value={formatNumber(dailyStoreReport.cashSales)}
                          onChange={(e) => handleInputChange('cashSales', e.target.value)}
                          className={inputStyle}
                        />
                      </div>
                    </td>
                    <td className="border border-gray-300 py-2 px-3 text-right">¥{formatNumber(monthlyStoreReport.cashSales)}</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 py-2 px-3">カード売上</td>
                    <td className="border border-gray-300 py-2 px-3">
                      <div className="flex items-center">
                        <span className="text-[#454545] mr-1">¥</span>
                        <input
                          type="text"
                          value={formatNumber(dailyStoreReport.cardSales)}
                          onChange={(e) => handleInputChange('cardSales', e.target.value)}
                          className={inputStyle}
                        />
                      </div>
                    </td>
                    <td className="border border-gray-300 py-2 px-3 text-right">¥{formatNumber(monthlyStoreReport.cardSales)}</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 py-2 px-3">売掛金回収</td>
                    <td className="border border-gray-300 py-2 px-3">
                      <div className="flex items-center">
                        <span className="text-[#454545] mr-1">¥</span>
                        <input
                          type="text"
                          value={formatNumber(dailyStoreReport.receivablesCollection)}
                          onChange={(e) => handleInputChange('receivablesCollection', e.target.value)}
                          className={inputStyle}
                        />
                      </div>
                    </td>
                    <td className="border border-gray-300 py-2 px-3 text-right">¥{formatNumber(monthlyStoreReport.receivablesCollection)}</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 py-2 px-3">売掛金</td>
                    <td className="border border-gray-300 py-2 px-3">
                      <div className="flex items-center">
                        <span className="text-[#454545] mr-1">¥</span>
                        <input
                          type="text"
                          value={formatNumber(dailyStoreReport.receivables)}
                          onChange={(e) => handleInputChange('receivables', e.target.value)}
                          className={inputStyle}
                        />
                      </div>
                    </td>
                    <td className="border border-gray-300 py-2 px-3 text-right">¥{formatNumber(monthlyStoreReport.receivables)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            {/* 出金項目 */}
            <div>
              <h3 className="text-lg font-medium text-[#454545] mb-3">出金項目</h3>
              <table className="w-full border-collapse table-fixed">
                <thead>
                  <tr>
                    <th className="border border-gray-300 bg-gray-100 py-2 px-3 w-[110px]"></th>
                    <th className="border border-gray-300 bg-gray-100 py-2 px-3 text-center w-[150px]">本日合計</th>
                    <th className="border border-gray-300 bg-gray-100 py-2 px-3 text-center w-[100px]">当月累積</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-300 py-2 px-3">雑費</td>
                    <td className="border border-gray-300 py-2 px-3">
                      <div className="flex items-center">
                        <span className="text-[#454545] mr-1">¥</span>
                        <input
                          type="text"
                          value={formatNumber(dailyStoreReport.miscExpenses)}
                          onChange={(e) => handleInputChange('miscExpenses', e.target.value)}
                          className={inputStyle}
                        />
                      </div>
                    </td>
                    <td className="border border-gray-300 py-2 px-3 text-right">¥{formatNumber(monthlyStoreReport.miscExpenses)}</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 py-2 px-3">その他経費</td>
                    <td className="border border-gray-300 py-2 px-3">
                      <div className="flex items-center">
                        <span className="text-[#454545] mr-1">¥</span>
                        <input
                          type="text"
                          value={formatNumber(dailyStoreReport.otherExpenses)}
                          onChange={(e) => handleInputChange('otherExpenses', e.target.value)}
                          className={inputStyle}
                        />
                      </div>
                    </td>
                    <td className="border border-gray-300 py-2 px-3 text-right">¥{formatNumber(monthlyStoreReport.otherExpenses)}</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 py-2 px-3">キャスト日払</td>
                    <td className="border border-gray-300 py-2 px-3 text-right">¥{formatNumber(dailyStoreReport.castDailyPayment)}</td>
                    <td className="border border-gray-300 py-2 px-3 text-right">¥{formatNumber(monthlyStoreReport.castDailyPayment)}</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 py-2 px-3">社員日払い</td>
                    <td className="border border-gray-300 py-2 px-3 text-right">¥{formatNumber(dailyStoreReport.employeeDailyPayment)}</td>
                    <td className="border border-gray-300 py-2 px-3 text-right">¥{formatNumber(monthlyStoreReport.employeeDailyPayment)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          
          <div className="space-y-6">
            {/* 売上実績項目 */}
            <div>
              <h3 className="text-lg font-medium text-[#454545] mb-3">売上実績項目</h3>
              <table className="w-full border-collapse table-fixed">
                <thead>
                  <tr>
                    <th className="border border-gray-300 bg-gray-100 py-2 px-3 w-[110px]"></th>
                    <th className="border border-gray-300 bg-gray-100 py-2 px-3 text-center w-[150px]">本日合計</th>
                    <th className="border border-gray-300 bg-gray-100 py-2 px-3 text-center w-[100px]">当月累積</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-300 py-2 px-3">キャスト売上</td>
                    <td className="border border-gray-300 py-2 px-3 text-right">¥{formatNumber(dailyStoreReport.castSales)}</td>
                    <td className="border border-gray-300 py-2 px-3 text-right">¥{formatNumber(monthlyStoreReport.castSales)}</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 py-2 px-3">キャスト給与</td>
                    <td className="border border-gray-300 py-2 px-3 text-right">¥{formatNumber(dailyStoreReport.castSalary)}</td>
                    <td className="border border-gray-300 py-2 px-3 text-right">¥{formatNumber(monthlyStoreReport.castSalary)}</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 py-2 px-3">人件費率</td>
                    <td className="border border-gray-300 py-2 px-3 text-right">{formatPercent(dailyStoreReport.laborCostRatio)}</td>
                    <td className="border border-gray-300 py-2 px-3 text-right">{formatPercent(monthlyStoreReport.laborCostRatio)}</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 py-2 px-3">客組数</td>
                    <td className="border border-gray-300 py-2 px-3">
                      <div className="flex items-center justify-end">
                        <input
                          type="text"
                          value={formatNumber(dailyStoreReport.setCount)}
                          onChange={(e) => handleInputChange('setCount', e.target.value)}
                          className={inputStyle}
                        />
                        <span className="text-[#454545] ml-1">組</span>
                      </div>
                    </td>
                    <td className="border border-gray-300 py-2 px-3 text-right">{formatNumber(monthlyStoreReport.setCount)}組</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 py-2 px-3">客数</td>
                    <td className="border border-gray-300 py-2 px-3">
                      <div className="flex items-center justify-end">
                        <input
                          type="text"
                          value={formatNumber(dailyStoreReport.customerCount)}
                          onChange={(e) => handleInputChange('customerCount', e.target.value)}
                          className={inputStyle}
                        />
                        <span className="text-[#454545] ml-1">人</span>
                      </div>
                    </td>
                    <td className="border border-gray-300 py-2 px-3 text-right">{formatNumber(monthlyStoreReport.customerCount)}人</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 py-2 px-3">客単価</td>
                    <td className="border border-gray-300 py-2 px-3 text-right">¥{formatNumber(dailyStoreReport.averageSpendPerCustomer)}</td>
                    <td className="border border-gray-300 py-2 px-3 text-right">¥{formatNumber(monthlyStoreReport.averageSpendPerCustomer)}</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 py-2 px-3">粗利益</td>
                    <td className="border border-gray-300 py-2 px-3 text-right">¥{formatNumber(dailyStoreReport.grossProfit)}</td>
                    <td className="border border-gray-300 py-2 px-3 text-right">¥{formatNumber(monthlyStoreReport.grossProfit)}</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 py-2 px-3">粗利益率</td>
                    <td className="border border-gray-300 py-2 px-3 text-right">{formatPercent(dailyStoreReport.grossProfitMargin)}</td>
                    <td className="border border-gray-300 py-2 px-3 text-right">{formatPercent(monthlyStoreReport.grossProfitMargin)}</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 py-2 px-3">営業利益</td>
                    <td className="border border-gray-300 py-2 px-3 text-right">¥{formatNumber(dailyStoreReport.operatingProfit)}</td>
                    <td className="border border-gray-300 py-2 px-3 text-right">¥{formatNumber(monthlyStoreReport.operatingProfit)}</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 py-2 px-3">営業利益率</td>
                    <td className="border border-gray-300 py-2 px-3 text-right">{formatPercent(dailyStoreReport.operatingProfitMargin)}</td>
                    <td className="border border-gray-300 py-2 px-3 text-right">{formatPercent(monthlyStoreReport.operatingProfitMargin)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            {/* 現金関連 */}
            <div>
              <h3 className="text-lg font-medium text-[#454545] mb-3">現金関連</h3>
              <table className="w-full border-collapse table-fixed">
                <thead>
                  <tr>
                    <th className="border border-gray-300 bg-gray-100 py-2 px-3 w-[110px]"></th>
                    <th className="border border-gray-300 bg-gray-100 py-2 px-3 text-center w-[150px]">本日集計</th>
                    <th className="border border-gray-300 bg-gray-100 py-2 px-3 text-center w-[100px]">当月累計</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-300 py-2 px-3">実際現金</td>
                    <td className="border border-gray-300 py-2 px-3">
                      <div className="flex items-center">
                        <span className="text-[#454545] mr-1">¥</span>
                        <input
                          type="text"
                          value={formatNumber(dailyStoreReport.actualCash)}
                          onChange={(e) => handleInputChange('actualCash', e.target.value)}
                          className={inputStyle}
                        />
                      </div>
                    </td>
                    <td className="border border-gray-300 py-2 px-3 text-right">-</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 py-2 px-3">小銭繰越</td>
                    <td className="border border-gray-300 py-2 px-3">
                      <div className="flex items-center">
                        <span className="text-[#454545] mr-1">¥</span>
                        <input
                          type="text"
                          value={formatNumber(dailyStoreReport.coinCarryover)}
                          onChange={(e) => handleInputChange('coinCarryover', e.target.value)}
                          className={inputStyle}
                        />
                      </div>
                    </td>
                    <td className="border border-gray-300 py-2 px-3 text-right">-</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 py-2 px-3">振込現金</td>
                    <td className="border border-gray-300 py-2 px-3">
                      <div className="flex items-center">
                        <span className="text-[#454545] mr-1">¥</span>
                        <input
                          type="text"
                          value={formatNumber(dailyStoreReport.transferredCash)}
                          onChange={(e) => handleInputChange('transferredCash', e.target.value)}
                          className={inputStyle}
                        />
                      </div>
                    </td>
                    <td className="border border-gray-300 py-2 px-3 text-right">¥{formatNumber(monthlyStoreReport.transferredCash)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      
      {/* 固定フッター - サイドバーの幅を考慮 */}
      <div className={`fixed bottom-0 ${isSidebarCollapsed ? 'left-[50px]' : 'left-[200px]'} right-0 bg-white/50 backdrop-blur-sm pt-2 pb-4 z-10`}>
        <div className="flex justify-center">
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-[#454545] text-white rounded-md font-medium hover:bg-[#353535] text-[14px]"
          >
            保存する
          </button>
        </div>
      </div>
    </>
  );
}
