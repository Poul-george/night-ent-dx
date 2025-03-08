'use client';

import { useState, useEffect } from 'react';
import { useMenuState } from '@/hooks/useMenuState';
import { CastDailyPerformance, StoreDailyPerformance } from '@/types/type';

type DailyReportTableForStoreProps = {
  date: { year: number; month: number; day: number };
  storeId: number;
  castDailyPerformances: CastDailyPerformance[];
};

export default function DailyReportTableForStore({ date, storeId, castDailyPerformances }: DailyReportTableForStoreProps) {
  const { isSidebarCollapsed } = useMenuState();
  
  // 店舗日報データのステート
  const [storeReport, setStoreReport] = useState<StoreDailyPerformance>({
    id: 0,
    storeId: storeId,
    performanceDate: new Date(`${date.year}-${date.month}-${date.day}`),
    
    // 入金項目
    totalSales: 0,
    cashSales: 0,
    cardSales: 0,
    receivablesCollection: 0,
    receivables: 0,
    
    // 出金項目
    miscExpenses: 0,
    otherExpenses: 0,
    castDailyPayment: 0,
    employeeDailyPayment: 0,
    
    // 売上関連
    castSales: 0,
    castSalary: 0,
    laborCostRatio: 0,
    setCount: 0,
    customerCount: 0,
    averageSpendPerCustomer: 0,
    grossProfit: 0,
    grossProfitMargin: 0,
    operatingProfit: 0,
    operatingProfitMargin: 0,
    
    // 現金関連
    actualCash: 0,
    coinCarryover: 0,
    transferredCash: 0
  });
  
  // キャストデータが変更されたときに集計を更新
  useEffect(() => {
    // キャスト売上合計の計算
    const castSalesTotal = castDailyPerformances.reduce((sum, cast) => {
      return sum + cast.drinkSubtotal + cast.bottleSubtotal + cast.foodSubtotal;
    }, 0);
    
    // キャスト給与合計の計算
    const castSalaryTotal = castDailyPerformances.reduce((sum, cast) => {
      return sum + cast.timeReward + cast.drinkSubtotalBack + cast.bottleSubtotalBack + cast.foodSubtotalBack + cast.bonus;
    }, 0);
    
    // キャスト日払い合計の計算
    const castDailyPaymentTotal = castDailyPerformances.reduce((sum, cast) => {
      if (cast.salarySystem === 1) {
        return sum + cast.dailyPayment;
      }
      return sum;
    }, 0);
    
    // 社員日払い合計の計算
    const staffDailyPaymentTotal = castDailyPerformances.reduce((sum, cast) => {
      if (cast.salarySystem === 0) {
        return sum + cast.dailyPayment;
      }
      return sum;
    }, 0);
    
    // 人件費率の計算
    const laborCostRatio = castSalesTotal > 0 ? Math.round((castSalaryTotal / castSalesTotal) * 100) : 0;
    
    // 粗利益の計算
    const grossProfit = castSalesTotal - castSalaryTotal;
    
    // 粗利益率の計算
    const grossProfitMargin = castSalesTotal > 0 ? Math.round((grossProfit / castSalesTotal) * 100) : 0;
    
    // 営業利益の計算
    const operatingProfit = grossProfit - (storeReport.miscExpenses + storeReport.otherExpenses);
    
    // 営業利益率の計算
    const operatingProfitMargin = castSalesTotal > 0 ? Math.round((operatingProfit / castSalesTotal) * 100) : 0;
    
    // 店舗レポートの更新
    setStoreReport(prev => ({
      ...prev,
      castSales: castSalesTotal,
      castSalary: castSalaryTotal,
      castDailyPayment: castDailyPaymentTotal,
      employeeDailyPayment: staffDailyPaymentTotal,
      laborCostRatio: laborCostRatio,
      grossProfit: grossProfit,
      grossProfitMargin: grossProfitMargin,
      operatingProfit: operatingProfit,
      operatingProfitMargin: operatingProfitMargin,
      totalSales: prev.cashSales + prev.cardSales + prev.receivables // 現金売上とカード売上と売掛金の合計
    }));
  }, [castDailyPerformances, storeReport.miscExpenses, storeReport.otherExpenses]);
  
  // 入力ハンドラー
  const handleInputChange = (field: keyof StoreDailyPerformance, value: string) => {
    const numericValue = value.replace(/[^\d]/g, '');
    const numberValue = numericValue ? parseInt(numericValue, 10) : 0;
    
    setStoreReport(prev => {
      const updated = { ...prev, [field]: numberValue };
      
      // 客単価の自動計算
      if (field === 'customerCount' && updated.customerCount > 0) {
        updated.averageSpendPerCustomer = Math.round(updated.castSales / updated.customerCount);
      }
      
      return updated;
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
        body: JSON.stringify(storeReport),
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
  
  // 数値のフォーマット（カンマ区切り）
  const formatNumber = (num: number) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };
  
  // パーセント表示用フォーマット
  const formatPercent = (num: number) => {
    return `${num}%`;
  };
  
  // 入力フィールドのスタイル
  const inputStyle = "w-full border border-gray-300 rounded p-1 text-right text-[14px] text-[#454545]";
  
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
                    <td className="border border-gray-300 py-2 px-3 text-right">¥{formatNumber(storeReport.totalSales)}</td>
                    <td className="border border-gray-300 py-2 px-3 text-right">¥{formatNumber(0)}</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 py-2 px-3">現金売上</td>
                    <td className="border border-gray-300 py-2 px-3">
                      <div className="flex items-center">
                        <span className="text-[#454545] mr-1">¥</span>
                        <input
                          type="text"
                          value={formatNumber(storeReport.cashSales)}
                          onChange={(e) => handleInputChange('cashSales', e.target.value)}
                          className={inputStyle}
                        />
                      </div>
                    </td>
                    <td className="border border-gray-300 py-2 px-3 text-right">¥{formatNumber(0)}</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 py-2 px-3">カード売上</td>
                    <td className="border border-gray-300 py-2 px-3">
                      <div className="flex items-center">
                        <span className="text-[#454545] mr-1">¥</span>
                        <input
                          type="text"
                          value={formatNumber(storeReport.cardSales)}
                          onChange={(e) => handleInputChange('cardSales', e.target.value)}
                          className={inputStyle}
                        />
                      </div>
                    </td>
                    <td className="border border-gray-300 py-2 px-3 text-right">¥{formatNumber(0)}</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 py-2 px-3">売掛金回収</td>
                    <td className="border border-gray-300 py-2 px-3">
                      <div className="flex items-center">
                        <span className="text-[#454545] mr-1">¥</span>
                        <input
                          type="text"
                          value={formatNumber(storeReport.receivablesCollection)}
                          onChange={(e) => handleInputChange('receivablesCollection', e.target.value)}
                          className={inputStyle}
                        />
                      </div>
                    </td>
                    <td className="border border-gray-300 py-2 px-3 text-right">¥{formatNumber(0)}</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 py-2 px-3">売掛金</td>
                    <td className="border border-gray-300 py-2 px-3">
                      <div className="flex items-center">
                        <span className="text-[#454545] mr-1">¥</span>
                        <input
                          type="text"
                          value={formatNumber(storeReport.receivables)}
                          onChange={(e) => handleInputChange('receivables', e.target.value)}
                          className={inputStyle}
                        />
                      </div>
                    </td>
                    <td className="border border-gray-300 py-2 px-3 text-right">¥{formatNumber(0)}</td>
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
                          value={formatNumber(storeReport.miscExpenses)}
                          onChange={(e) => handleInputChange('miscExpenses', e.target.value)}
                          className={inputStyle}
                        />
                      </div>
                    </td>
                    <td className="border border-gray-300 py-2 px-3 text-right">¥{formatNumber(0)}</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 py-2 px-3">その他経費</td>
                    <td className="border border-gray-300 py-2 px-3">
                      <div className="flex items-center">
                        <span className="text-[#454545] mr-1">¥</span>
                        <input
                          type="text"
                          value={formatNumber(storeReport.otherExpenses)}
                          onChange={(e) => handleInputChange('otherExpenses', e.target.value)}
                          className={inputStyle}
                        />
                      </div>
                    </td>
                    <td className="border border-gray-300 py-2 px-3 text-right">¥{formatNumber(0)}</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 py-2 px-3">キャスト日払</td>
                    <td className="border border-gray-300 py-2 px-3 text-right">¥{formatNumber(storeReport.castDailyPayment)}</td>
                    <td className="border border-gray-300 py-2 px-3 text-right">¥{formatNumber(0)}</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 py-2 px-3">社員日払い</td>
                    <td className="border border-gray-300 py-2 px-3 text-right">¥{formatNumber(storeReport.employeeDailyPayment)}</td>
                    <td className="border border-gray-300 py-2 px-3 text-right">¥{formatNumber(0)}</td>
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
                    <td className="border border-gray-300 py-2 px-3 text-right">¥{formatNumber(storeReport.castSales)}</td>
                    <td className="border border-gray-300 py-2 px-3 text-right">¥{formatNumber(0)}</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 py-2 px-3">キャスト給与</td>
                    <td className="border border-gray-300 py-2 px-3 text-right">¥{formatNumber(storeReport.castSalary)}</td>
                    <td className="border border-gray-300 py-2 px-3 text-right">¥{formatNumber(0)}</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 py-2 px-3">人件費率</td>
                    <td className="border border-gray-300 py-2 px-3 text-right">{formatPercent(storeReport.laborCostRatio)}</td>
                    <td className="border border-gray-300 py-2 px-3 text-right">{formatPercent(0)}</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 py-2 px-3">客組数</td>
                    <td className="border border-gray-300 py-2 px-3">
                      <div className="flex items-center justify-end">
                        <input
                          type="text"
                          value={formatNumber(storeReport.setCount)}
                          onChange={(e) => handleInputChange('setCount', e.target.value)}
                          className={inputStyle}
                        />
                        <span className="text-[#454545] ml-1">組</span>
                      </div>
                    </td>
                    <td className="border border-gray-300 py-2 px-3 text-right">0組</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 py-2 px-3">客数</td>
                    <td className="border border-gray-300 py-2 px-3">
                      <div className="flex items-center justify-end">
                        <input
                          type="text"
                          value={formatNumber(storeReport.customerCount)}
                          onChange={(e) => handleInputChange('customerCount', e.target.value)}
                          className={inputStyle}
                        />
                        <span className="text-[#454545] ml-1">人</span>
                      </div>
                    </td>
                    <td className="border border-gray-300 py-2 px-3 text-right">0人</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 py-2 px-3">客単価</td>
                    <td className="border border-gray-300 py-2 px-3 text-right">¥{formatNumber(storeReport.averageSpendPerCustomer)}</td>
                    <td className="border border-gray-300 py-2 px-3 text-right">¥{formatNumber(0)}</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 py-2 px-3">粗利益</td>
                    <td className="border border-gray-300 py-2 px-3 text-right">¥{formatNumber(storeReport.grossProfit)}</td>
                    <td className="border border-gray-300 py-2 px-3 text-right">¥{formatNumber(0)}</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 py-2 px-3">粗利益率</td>
                    <td className="border border-gray-300 py-2 px-3 text-right">{formatPercent(storeReport.grossProfitMargin)}</td>
                    <td className="border border-gray-300 py-2 px-3 text-right">{formatPercent(0)}</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 py-2 px-3">営業利益</td>
                    <td className="border border-gray-300 py-2 px-3 text-right">¥{formatNumber(storeReport.operatingProfit)}</td>
                    <td className="border border-gray-300 py-2 px-3 text-right">¥{formatNumber(0)}</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 py-2 px-3">営業利益率</td>
                    <td className="border border-gray-300 py-2 px-3 text-right">{formatPercent(storeReport.operatingProfitMargin)}</td>
                    <td className="border border-gray-300 py-2 px-3 text-right">{formatPercent(42)}</td>
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
                          value={formatNumber(storeReport.actualCash)}
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
                          value={formatNumber(storeReport.coinCarryover)}
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
                          value={formatNumber(storeReport.transferredCash)}
                          onChange={(e) => handleInputChange('transferredCash', e.target.value)}
                          className={inputStyle}
                        />
                      </div>
                    </td>
                    <td className="border border-gray-300 py-2 px-3 text-right">¥{formatNumber(0)}</td>
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