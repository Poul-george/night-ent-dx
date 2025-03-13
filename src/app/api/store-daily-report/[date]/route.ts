import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { StoreDailyPerformance } from '@/types/type';

const prisma = new PrismaClient();

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ date: string }> }
) {
  try {
    // URLからパラメータを取得
    const { date } = await params;
    const { searchParams } = new URL(request.url);
    const storeId = searchParams.get('storeId');
    
    if (!date || !storeId) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    // リクエストボディを取得
    const storeReport = await request.json();
    
    // 日付をパース
    const [year, month, day] = date.split('-').map(Number);
    const performanceDate = new Date(year, month - 1, day);
    
    // 既存の日報を検索
    let existingReport = null;
    try {
      existingReport = await prisma.storeDailyPerformance.findFirst({
        where: {
          storeId: Number(storeId),
          performanceDate: {
            gte: new Date(new Date(performanceDate).setHours(0, 0, 0, 0)),
            lt: new Date(new Date(performanceDate).setHours(23, 59, 59, 999)),
          },
        },
      });
    } catch (error) {
      console.error('Error finding existing report:', error);
      // エラーが発生しても処理を続行（新規作成として扱う）
    }

    let result;
    
    if (existingReport) {
      // 既存の日報を更新
      result = await prisma.storeDailyPerformance.update({
        where: { id: existingReport.id },
        data: {
          // 入金項目
          cashSales: Number(storeReport.cashSales),
          cardSales: Number(storeReport.cardSales),
          receivables: Number(storeReport.receivables),
          receivablesCollection: Number(storeReport.receivablesCollection),
          
          // 出金項目
          miscExpenses: Number(storeReport.miscExpenses),
          otherExpenses: Number(storeReport.otherExpenses),
          
          // 売上関連
          setCount: Number(storeReport.setCount),
          customerCount: Number(storeReport.customerCount),
          
          // 現金関連
          actualCash: Number(storeReport.actualCash),
          coinCarryover: Number(storeReport.coinCarryover),
          transferredCash: Number(storeReport.transferredCash),
          
          // 更新情報
          updatedAt: new Date(),
        },
      });
    } else {
      // 新規日報を作成
      result = await prisma.storeDailyPerformance.create({
        data: {
          storeId: Number(storeId),
          performanceDate: performanceDate,
          
          // 入金項目
          cashSales: Number(storeReport.cashSales),
          cardSales: Number(storeReport.cardSales),
          receivables: Number(storeReport.receivables),
          receivablesCollection: Number(storeReport.receivablesCollection),
          
          // 出金項目
          miscExpenses: Number(storeReport.miscExpenses),
          otherExpenses: Number(storeReport.otherExpenses),
          
          // 売上関連
          setCount: Number(storeReport.setCount),
          customerCount: Number(storeReport.customerCount),
          
          // 現金関連
          actualCash: Number(storeReport.actualCash),
          coinCarryover: Number(storeReport.coinCarryover),
          transferredCash: Number(storeReport.transferredCash),
        },
      });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in store daily report API:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ date: string }> }
) {
  try {
    // URLからパラメータを取得
    const { date } = await params;
    const { searchParams } = new URL(request.url);
    const storeId = searchParams.get('storeId');
    
    if (!date || !storeId) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    // 日付をパース
    const [year, month, day] = date.split('-').map(Number);
    const performanceDate = new Date(year, month - 1, day);
    
    // 日報を検索（指定日のもの）
    let storeReport: StoreDailyPerformance | null = null;
    try {
      const storeReportForDB = await prisma.storeDailyPerformance.findFirst({
        where: {
          storeId: Number(storeId),
          performanceDate: {
            gte: new Date(new Date(performanceDate).setHours(0, 0, 0, 0)),
            lt: new Date(new Date(performanceDate).setHours(23, 59, 59, 999)),
          },
        },
      });
      console.log("storeId ", storeId);
      console.log("performanceDate ", performanceDate);
      console.log("gte performanceDate ", new Date(new Date(performanceDate).setHours(0, 0, 0, 0)));
      console.log("lt performanceDate ", new Date(new Date(performanceDate).setHours(23, 59, 59, 999)));
      console.log("storeReportForDB ", storeReportForDB);

      if (storeReportForDB) {
        storeReport = {
          id: storeReportForDB.id,
          storeId: storeReportForDB.storeId,
          performanceDate: storeReportForDB.performanceDate,
          totalSales: 0, //総売上
          cashSales: Number(storeReportForDB.cashSales),//現金売上
          cardSales: Number(storeReportForDB.cardSales),//カード売上
          receivablesCollection: Number(storeReportForDB.receivablesCollection),//売掛金回収額
          receivables: Number(storeReportForDB.receivables),//売掛金残高
          miscExpenses: Number(storeReportForDB.miscExpenses),//雑費
          otherExpenses: Number(storeReportForDB.otherExpenses),//その他経費
          setCount: Number(storeReportForDB.setCount),//組数
          customerCount: Number(storeReportForDB.customerCount),//客数
          actualCash: Number(storeReportForDB.actualCash),//現金実績
          coinCarryover: Number(storeReportForDB.coinCarryover),//硬貨回収額
          transferredCash: Number(storeReportForDB.transferredCash),//振込額
          castSales: 0,//キャスト売上
          castSalary: 0,//キャスト給与
          castDailyPayment: 0,//キャスト日払い
          employeeDailyPayment: 0,//従業員日払い
          averageSpendPerCustomer: 0,//客単価
          grossProfit: 0,//粗利
          grossProfitMargin: 0,//粗利率
          operatingProfit: 0,//営業利益
          operatingProfitMargin: 0,//営業利益率
          laborCostRatio: 0,//人件費率
        } 
      }

      console.log("storeReport ", storeReport);
    } catch (error) {
      console.error('Error finding store report:', error);
      // エラーが発生した場合は空のデータを返す
    }

    // 月報(yyyy-mm)の集計
    let monthlyReport: StoreDailyPerformance | null = null;
    try {
      // 月の初日と翌月初日を算出
      const monthStart = new Date(year, month - 1, 1);
      const monthEnd = new Date(year, month, 1);
      
      // ① 店舗日報の集計
      const monthlyReportForDB = await prisma.storeDailyPerformance.aggregate({
        where: {
          storeId: Number(storeId),
          performanceDate: {
            gte: monthStart,
            lt: monthEnd,
          },
        },
        _sum: {
          cashSales: true,
          cardSales: true,
          receivablesCollection: true,
          receivables: true,
          miscExpenses: true,
          otherExpenses: true,
          setCount: true,
          customerCount: true,
          actualCash: true,
          coinCarryover: true,
          transferredCash: true,
        }
      });

      // キャスト売上、キャスト給与、キャスト日払いの合算を計算する
      const castRecords = await prisma.castDailyPerformance.findMany({
        where: {
          storeId: Number(storeId),
          performanceDate: {
            gte: monthStart,
            lt: monthEnd,
          },
        },
        include: {
          cast: true, // castテーブル（timeReward, salarySystem など）をJOIN
        },
      });

      let totalDrinkSubtotal = 0;
      let totalBottleSubtotal = 0;
      let totalFoodSubtotal = 0;
      let totalTimeReward = 0;
      let totalDrinkSubtotalBack = 0;
      let totalBottleSubtotalBack = 0;
      let totalFoodSubtotalBack = 0;
      let totalBonus = 0;
      let totalDailyPayment = 0;
      
      castRecords.forEach(record => {
        totalDrinkSubtotal += Number(record.drinkSubtotal) || 0;
        totalBottleSubtotal += Number(record.bottleSubtotal) || 0;
        totalFoodSubtotal += Number(record.foodSubtotal) || 0;
        totalDrinkSubtotalBack += Number(record.drinkSubtotalBack) || 0;
        totalBottleSubtotalBack += Number(record.bottleSubtotalBack) || 0;
        totalFoodSubtotalBack += Number(record.foodSubtotalBack) || 0;
        totalBonus += Number(record.bonus) || 0;
        if (record.cast) {
          totalTimeReward += Number(record.cast.hourlyWage) || 0;
          if (record.cast.salarySystem === 1) {
            totalDailyPayment += Number(record.dailyPayment) || 0;
          }
        }
      });
      
      const castSalesValue = totalDrinkSubtotal + totalBottleSubtotal + totalFoodSubtotal;
      const castSalaryValue = totalTimeReward + totalDrinkSubtotalBack + totalBottleSubtotalBack + totalFoodSubtotalBack + totalBonus;
      const castDailyPaymentValue = totalDailyPayment;

      const cashSalesValue = Number(monthlyReportForDB._sum.cashSales) || 0;
      const cardSalesValue = Number(monthlyReportForDB._sum.cardSales) || 0;
      const receivablesValue = Number(monthlyReportForDB._sum.receivables) || 0;
      const receivablesCollectionValue = Number(monthlyReportForDB._sum.receivablesCollection) || 0;
      const miscExpensesValue = Number(monthlyReportForDB._sum.miscExpenses) || 0;
      const otherExpensesValue = Number(monthlyReportForDB._sum.otherExpenses) || 0;
      const setCountValue = Number(monthlyReportForDB._sum.setCount) || 0;
      const customerCountValue = Number(monthlyReportForDB._sum.customerCount) || 0;
      const actualCashValue = Number(monthlyReportForDB._sum.actualCash) || 0;
      const coinCarryoverValue = Number(monthlyReportForDB._sum.coinCarryover) || 0;
      const transferredCashValue = Number(monthlyReportForDB._sum.transferredCash) || 0;

      const totalSalesValue = cashSalesValue + cardSalesValue + receivablesValue;

      const averageSpendPerCustomer = customerCountValue > 0 ? Math.round(totalSalesValue / customerCountValue) : 0;
      const grossProfit = totalSalesValue - miscExpensesValue;
      const grossProfitMargin = totalSalesValue > 0 ? Math.round((grossProfit / totalSalesValue) * 1000) / 10 : 0;
      const operatingProfit = grossProfit - (otherExpensesValue + castSalaryValue);
      const operatingProfitMargin = totalSalesValue > 0 ? Math.round((operatingProfit / totalSalesValue) * 1000) / 10 : 0;
      const laborCostRatio = totalSalesValue > 0 ? Math.round((castSalaryValue / totalSalesValue) * 1000) / 10 : 0;

      monthlyReport = {
        id: 0,
        storeId: Number(storeId),
        performanceDate: monthStart,
        totalSales: totalSalesValue, //総売上
        cashSales: cashSalesValue, //現金売上
        cardSales: cardSalesValue, //カード売上
        receivablesCollection: receivablesCollectionValue, //売掛金回収額
        receivables: receivablesValue, //売掛金残高
        miscExpenses: miscExpensesValue, //雑費
        otherExpenses: otherExpensesValue, //その他経費
        setCount: setCountValue, //組数
        customerCount: customerCountValue, //客数
        actualCash: actualCashValue, //現金実績
        coinCarryover: coinCarryoverValue, //硬貨回収額
        transferredCash: transferredCashValue, //振込額
        castSales: castSalesValue, //キャスト売上
        castSalary: castSalaryValue, //キャスト給与
        castDailyPayment: castDailyPaymentValue, //キャスト日払い
        employeeDailyPayment: 0, //従業員日払い
        averageSpendPerCustomer: averageSpendPerCustomer, //客単価
        grossProfit: grossProfit, //粗利
        grossProfitMargin: grossProfitMargin, //粗利率
        operatingProfit: operatingProfit, //営業利益
        operatingProfitMargin: operatingProfitMargin, //営業利益率
        laborCostRatio: laborCostRatio,
      }
    } catch (error) {
      console.error('Error aggregating monthly report:', error);
    }

    // 返却する：storeReport と monthlyReport
    return NextResponse.json({ storeReport, monthlyReport });
  } catch (error) {
    console.error('Error in store daily report API:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
