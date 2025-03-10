import { CastDailyPerformance, StoreDailyPerformance } from '@/types/type';

/**
 * 店舗日報の計算値を算出する関数
 * @param reportData 現在の店舗日報データ
 * @param castDailyPerformances キャスト日報データの配列
 * @returns 計算された値を含むオブジェクト
 */
export const calculateReportValues = (
  reportData: StoreDailyPerformance,
  castDailyPerformances: CastDailyPerformance[]
) => {
  // キャスト売上合計の計算
  const castSalesTotal = castDailyPerformances.reduce((sum, cast) => {
    return sum + Number(cast.drinkSubtotal) + Number(cast.bottleSubtotal) + Number(cast.foodSubtotal);
  }, 0);
  
  // キャスト給与合計の計算
  const castSalaryTotal = castDailyPerformances.reduce((sum, cast) => {
    return sum + Number(cast.timeReward) + Number(cast.drinkSubtotalBack) + Number(cast.bottleSubtotalBack) + Number(cast.foodSubtotalBack) + Number(cast.bonus);
  }, 0);
  
  // キャスト日払い合計の計算
  const castDailyPaymentTotal = castDailyPerformances.reduce((sum, cast) => {
    if (cast.salarySystem === 1) {
      return sum + Number(cast.dailyPayment);
    }
    return sum;
  }, 0);
  
  // 社員日払い合計の計算
  const staffDailyPaymentTotal = castDailyPerformances.reduce((sum, cast) => {
    if (cast.salarySystem === 0) {
      return sum + Number(cast.dailyPayment);
    }
    return sum;
  }, 0);
  
  // 総売上の計算（現金売上、カード売上、売掛金の合計）
  const totalSales = Number(reportData.cashSales) + Number(reportData.cardSales) + Number(reportData.receivables);
  
  // 人件費率の計算 (小数点第一位まで、第二位を四捨五入)
  const laborCostRatio = castSalesTotal > 0 ? Math.round((castSalaryTotal / castSalesTotal) * 1000) / 10 : 0;
  
  // 粗利益の計算
  const grossProfit = totalSales - Number(reportData.miscExpenses);
  
  // 粗利益率の計算 (小数点第一位まで、第二位を四捨五入)
  const grossProfitMargin = totalSales > 0 ? Math.round((grossProfit / totalSales) * 1000) / 10 : 0;
  
  // 営業利益の計算
  const operatingProfit = grossProfit - (Number(reportData.otherExpenses) + castSalaryTotal);
  
  // 営業利益率の計算 (小数点第一位まで、第二位を四捨五入)
  const operatingProfitMargin = totalSales > 0 ? Math.round((operatingProfit / totalSales) * 1000) / 10 : 0;
  
  // 客単価の計算
  const averageSpendPerCustomer = Number(reportData.customerCount) > 0 
    ? Math.round(castSalesTotal / Number(reportData.customerCount)) 
    : 0;
  
  // 計算結果をオブジェクトとして返す
  return {
    castSales: castSalesTotal,
    castSalary: castSalaryTotal,
    castDailyPayment: castDailyPaymentTotal,
    employeeDailyPayment: staffDailyPaymentTotal,
    laborCostRatio: laborCostRatio,
    totalSales: totalSales,
    grossProfit: grossProfit,
    grossProfitMargin: grossProfitMargin,
    operatingProfit: operatingProfit,
    operatingProfitMargin: operatingProfitMargin,
    averageSpendPerCustomer: averageSpendPerCustomer
  };
}; 
